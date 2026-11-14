const http = require("http");
const app = require("./app");

function request(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = "";
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () => {
                let parsed = body;
                try {
                    parsed = JSON.parse(body);
                } catch (e) {}
                resolve({ status: res.statusCode, headers: res.headers, body: parsed });
            });
        });
        req.on("error", reject);
        if (data) {
            req.write(typeof data === "string" ? data : JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log("=== Starting SeedShare API Test Suite ===");
    const results = [];
    let passed = 0;
    let failed = 0;

    function assert(testName, condition, details = "") {
        if (condition) {
            console.log(`[PASS] ${testName}`);
            passed++;
            results.push({ name: testName, status: "PASS" });
        } else {
            console.error(`[FAIL] ${testName} - ${details}`);
            failed++;
            results.push({ name: testName, status: "FAIL", details });
        }
    }

    const port = 3001; // Use separate port for test
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(port, resolve));
    console.log(`Test server running on port ${port}\n`);

    const baseOpts = (path, method = "GET", headers = {}) => ({
        hostname: "127.0.0.1",
        port,
        path,
        method,
        headers: { "Content-Type": "application/json", ...headers }
    });

    try {
        // 1. Home route
        const homeRes = await request(baseOpts("/"));
        assert("GET / (Home)", homeRes.status === 200 && homeRes.body === "Welcome to SeedShare API!", `Got ${homeRes.status}: ${JSON.stringify(homeRes.body)}`);

        // 2. Health check
        const healthRes = await request(baseOpts("/health"));
        assert("GET /health", healthRes.status === 200 && healthRes.body.status === "healthy", `Got ${healthRes.status}: ${JSON.stringify(healthRes.body)}`);

        // 3. Gardeners Validation - Missing fields
        const badGardener = await request(baseOpts("/gardeners", "POST"), { name: "" });
        assert("POST /gardeners (Empty fields validation)", badGardener.status === 400, `Expected 400, got ${badGardener.status}`);

        // 4. Gardeners Create
        const testEmail = `test_${Date.now()}@example.com`;
        const createGardener = await request(baseOpts("/gardeners", "POST"), { name: "John Doe", email: testEmail });
        assert("POST /gardeners (Create gardener)", createGardener.status === 201 && createGardener.body.id, `Got ${createGardener.status}: ${JSON.stringify(createGardener.body)}`);
        const gardenerId = createGardener.body?.id;

        // 5. Gardeners Duplicate Email Validation
        const dupGardener = await request(baseOpts("/gardeners", "POST"), { name: "Duplicate", email: testEmail });
        assert("POST /gardeners (Duplicate email constraint)", dupGardener.status === 400, `Expected 400, got ${dupGardener.status}`);

        // 6. Gardeners Get All
        const allGardeners = await request(baseOpts("/gardeners"));
        assert("GET /gardeners (Get all)", allGardeners.status === 200 && Array.isArray(allGardeners.body), `Got ${allGardeners.status}`);

        // 7. Gardeners Get One
        const oneGardener = await request(baseOpts(`/gardeners/${gardenerId}`));
        assert("GET /gardeners/:id (Get one)", oneGardener.status === 200 && oneGardener.body.name === "John Doe", `Got ${oneGardener.status}`);

        // 8. Gardeners Update
        const updateGardener = await request(baseOpts(`/gardeners/${gardenerId}`, "PUT"), { name: "Johnathan Doe", email: testEmail });
        assert("PUT /gardeners/:id (Update gardener)", updateGardener.status === 200, `Got ${updateGardener.status}`);

        // 9. Plots Create Plot A (Clay) & Plot B (Sandy)
        const createPlot1 = await request(baseOpts("/plots", "POST"), { name: "Plot A - Tomato Row", soil: "Clay" });
        const createPlot2 = await request(baseOpts("/plots", "POST"), { name: "Plot B - Herb Patch", soil: "Sandy" });
        assert("POST /plots (Create Plot 1)", createPlot1.status === 201 && createPlot1.body.id, `Got ${createPlot1.status}`);
        assert("POST /plots (Create Plot 2)", createPlot2.status === 201 && createPlot2.body.id, `Got ${createPlot2.status}`);
        const plot1Id = createPlot1.body?.id;
        const plot2Id = createPlot2.body?.id;

        // 10. Plots Search by soil
        const clayPlots = await request(baseOpts("/plots?soil=Clay"));
        assert("GET /plots?soil=Clay (Filter by soil)", clayPlots.status === 200 && clayPlots.body.some(p => p.id === plot1Id), `Got ${clayPlots.status}`);

        // 11. Plots Get One
        const onePlot = await request(baseOpts(`/plots/${plot1Id}`));
        assert("GET /plots/:id (Get one)", onePlot.status === 200 && onePlot.body.name === "Plot A - Tomato Row", `Got ${onePlot.status}`);

        // 12. Leases Date Validation - end_date < start_date
        const badDateOrder = await request(baseOpts("/leases", "POST"), {
            gardener_id: gardenerId,
            plot_id: plot1Id,
            start_date: "2026-06-30",
            end_date: "2026-06-01"
        });
        assert("POST /leases (End date before start date validation)", badDateOrder.status === 400, `Expected 400, got ${badDateOrder.status}`);

        // 13. Leases Invalid Calendar Date - e.g. Feb 31
        const invalidCalendarDate = await request(baseOpts("/leases", "POST"), {
            gardener_id: gardenerId,
            plot_id: plot1Id,
            start_date: "2026-02-31",
            end_date: "2026-03-10"
        });
        assert("POST /leases (Invalid calendar date validation)", invalidCalendarDate.status === 400, `Expected 400, got ${invalidCalendarDate.status}`);

        // 14. Leases Foreign Key Validation - Non-existent gardener
        const foreignKeyLease = await request(baseOpts("/leases", "POST"), {
            gardener_id: 999999,
            plot_id: plot1Id,
            start_date: "2026-06-01",
            end_date: "2026-06-30"
        });
        assert("POST /leases (Foreign key validation on non-existent gardener)", foreignKeyLease.status === 400, `Expected 400, got ${foreignKeyLease.status}`);

        // 15. Leases Create Valid Lease (Plot 1 leased from 2026-06-01 to 2026-06-30)
        const createLease = await request(baseOpts("/leases", "POST"), {
            gardener_id: gardenerId,
            plot_id: plot1Id,
            start_date: "2026-06-01",
            end_date: "2026-06-30"
        });
        assert("POST /leases (Create valid lease)", createLease.status === 201 && createLease.body.id, `Got ${createLease.status}`);
        const leaseId = createLease.body?.id;

        // 16. Leases Get All (Joins)
        const allLeases = await request(baseOpts("/leases"));
        assert("GET /leases (Get all with JOINs)", allLeases.status === 200 && allLeases.body.some(l => l.id === leaseId && l.gardener_name && l.plot_name), `Got ${allLeases.status}: ${JSON.stringify(allLeases.body)}`);

        // 17. Leases Get One
        const oneLease = await request(baseOpts(`/leases/${leaseId}`));
        assert("GET /leases/:id (Get one)", oneLease.status === 200 && oneLease.body.id === leaseId, `Got ${oneLease.status}`);

        // 18. Plots Available - Date during lease (2026-06-15) -> Plot 1 unavailable, Plot 2 available
        const availMidLease = await request(baseOpts("/plots/available?date=2026-06-15"));
        const midLeasePlots = availMidLease.body || [];
        const plot1Available = midLeasePlots.some(p => p.id === plot1Id);
        const plot2Available = midLeasePlots.some(p => p.id === plot2Id);
        assert("GET /plots/available?date=2026-06-15 (Plot 1 excluded, Plot 2 included)", availMidLease.status === 200 && !plot1Available && plot2Available, `Plot 1 avail: ${plot1Available}, Plot 2 avail: ${plot2Available}`);

        // 19. Plots Available - Date after lease (2026-07-01) -> Both available
        const availPostLease = await request(baseOpts("/plots/available?date=2026-07-01"));
        const postLeasePlots = availPostLease.body || [];
        const postPlot1Avail = postLeasePlots.some(p => p.id === plot1Id);
        assert("GET /plots/available?date=2026-07-01 (Plot 1 available after lease ends)", availPostLease.status === 200 && postPlot1Avail, `Plot 1 avail: ${postPlot1Avail}`);

        // 20. Plots Available - Invalid date format
        const badAvailDate = await request(baseOpts("/plots/available?date=not-a-date"));
        assert("GET /plots/available?date=not-a-date (Bad date format)", badAvailDate.status === 400, `Expected 400, got ${badAvailDate.status}`);

        // 21. Plots Available - Invalid calendar date (Feb 30)
        const badCalendarAvail = await request(baseOpts("/plots/available?date=2026-02-30"));
        assert("GET /plots/available?date=2026-02-30 (Invalid calendar date)", badCalendarAvail.status === 400, `Expected 400, got ${badCalendarAvail.status}`);

        // 22. Leases Delete
        const deleteLease = await request(baseOpts(`/leases/${leaseId}`, "DELETE"));
        assert("DELETE /leases/:id (Delete lease)", deleteLease.status === 200, `Got ${deleteLease.status}`);

        // 23. Plots Delete
        const deletePlot1 = await request(baseOpts(`/plots/${plot1Id}`, "DELETE"));
        const deletePlot2 = await request(baseOpts(`/plots/${plot2Id}`, "DELETE"));
        assert("DELETE /plots/:id (Delete plots)", deletePlot1.status === 200 && deletePlot2.status === 200, `Got ${deletePlot1.status}, ${deletePlot2.status}`);

        // 24. Gardeners Delete
        const deleteGardener = await request(baseOpts(`/gardeners/${gardenerId}`, "DELETE"));
        assert("DELETE /gardeners/:id (Delete gardener)", deleteGardener.status === 200, `Got ${deleteGardener.status}`);

    } finally {
        await new Promise(resolve => server.close(resolve));
        const db = require("./database");
        db.close();
        console.log(`\n=== Test Results: ${passed} Passed, ${failed} Failed ===`);
    }

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch((err) => {
    console.error("Test execution error:", err);
    process.exit(1);
});
