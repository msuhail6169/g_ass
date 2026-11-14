const express = require("express");
const db = require("./database");

const app = express();
app.use(express.json());

// Import routes
const gardenersRoutes = require("./routes/gardeners");
const plotsRoutes = require("./routes/plots");
const leasesRoutes = require("./routes/leases");

// Register routes
app.use("/gardeners", gardenersRoutes);
app.use("/plots", plotsRoutes);
app.use("/leases", leasesRoutes);

// Home route
app.get("/", (req, res) => {
    res.status(200).send("Welcome to SeedShare API!");
});

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        message: "SeedShare API is running",
        status: "healthy"
    });
});

// Start server
const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;

