class MemoryDb {
    constructor() {
        this.gardeners = [];
        this.plots = [];
        this.leases = [];
        this.gardenerId = 1;
        this.plotId = 1;
        this.leaseId = 1;
    }

    serialize(fn) {
        if (fn) fn();
    }

    run(sql, params, callback) {
        if (typeof params === "function") {
            callback = params;
            params = [];
        }
        params = params || [];
        callback = callback || (() => {});

        const trimmed = sql.trim().toUpperCase();

        if (trimmed.startsWith("PRAGMA") || trimmed.startsWith("CREATE TABLE")) {
            return callback.call({ changes: 0, lastID: 0 }, null);
        }

        // INSERT INTO gardeners (name, email) VALUES (?, ?)
        if (trimmed.startsWith("INSERT INTO GARDENERS")) {
            const [name, email] = params;
            if (this.gardeners.some(g => g.email === email)) {
                return callback.call(null, new Error("UNIQUE constraint failed: gardeners.email"));
            }
            const id = this.gardenerId++;
            this.gardeners.push({ id, name, email });
            return callback.call({ lastID: id, changes: 1 }, null);
        }

        // UPDATE gardeners SET name = ?, email = ? WHERE id = ?
        if (trimmed.startsWith("UPDATE GARDENERS")) {
            const [name, email, id] = params;
            const idx = this.gardeners.findIndex(g => g.id == id);
            if (idx === -1) {
                return callback.call({ changes: 0 }, null);
            }
            if (this.gardeners.some(g => g.email === email && g.id != id)) {
                return callback.call(null, new Error("UNIQUE constraint failed: gardeners.email"));
            }
            this.gardeners[idx].name = name;
            this.gardeners[idx].email = email;
            return callback.call({ changes: 1 }, null);
        }

        // DELETE FROM gardeners WHERE id = ?
        if (trimmed.startsWith("DELETE FROM GARDENERS")) {
            const [id] = params;
            const idx = this.gardeners.findIndex(g => g.id == id);
            if (idx === -1) {
                return callback.call({ changes: 0 }, null);
            }
            this.gardeners.splice(idx, 1);
            return callback.call({ changes: 1 }, null);
        }

        // INSERT INTO plots (name, soil) VALUES (?, ?)
        if (trimmed.startsWith("INSERT INTO PLOTS")) {
            const [name, soil] = params;
            const id = this.plotId++;
            this.plots.push({ id, name, soil });
            return callback.call({ lastID: id, changes: 1 }, null);
        }

        // UPDATE plots SET name = ?, soil = ? WHERE id = ?
        if (trimmed.startsWith("UPDATE PLOTS")) {
            const [name, soil, id] = params;
            const idx = this.plots.findIndex(p => p.id == id);
            if (idx === -1) {
                return callback.call({ changes: 0 }, null);
            }
            this.plots[idx].name = name;
            this.plots[idx].soil = soil;
            return callback.call({ changes: 1 }, null);
        }

        // DELETE FROM plots WHERE id = ?
        if (trimmed.startsWith("DELETE FROM PLOTS")) {
            const [id] = params;
            const idx = this.plots.findIndex(p => p.id == id);
            if (idx === -1) {
                return callback.call({ changes: 0 }, null);
            }
            this.plots.splice(idx, 1);
            return callback.call({ changes: 1 }, null);
        }

        // INSERT INTO leases (gardener_id, plot_id, start_date, end_date) VALUES (?, ?, ?, ?)
        if (trimmed.startsWith("INSERT INTO LEASES")) {
            const [gardener_id, plot_id, start_date, end_date] = params;
            const gardenerExists = this.gardeners.some(g => g.id == gardener_id);
            const plotExists = this.plots.some(p => p.id == plot_id);
            if (!gardenerExists || !plotExists) {
                return callback.call(null, new Error("FOREIGN KEY constraint failed"));
            }
            const id = this.leaseId++;
            this.leases.push({ id, gardener_id: Number(gardener_id), plot_id: Number(plot_id), start_date, end_date });
            return callback.call({ lastID: id, changes: 1 }, null);
        }

        // UPDATE leases SET gardener_id = ?, plot_id = ?, start_date = ?, end_date = ? WHERE id = ?
        if (trimmed.startsWith("UPDATE LEASES")) {
            const [gardener_id, plot_id, start_date, end_date, id] = params;
            const idx = this.leases.findIndex(l => l.id == id);
            if (idx === -1) {
                return callback.call({ changes: 0 }, null);
            }
            const gardenerExists = this.gardeners.some(g => g.id == gardener_id);
            const plotExists = this.plots.some(p => p.id == plot_id);
            if (!gardenerExists || !plotExists) {
                return callback.call(null, new Error("FOREIGN KEY constraint failed"));
            }
            this.leases[idx] = { id: Number(id), gardener_id: Number(gardener_id), plot_id: Number(plot_id), start_date, end_date };
            return callback.call({ changes: 1 }, null);
        }

        // DELETE FROM leases WHERE id = ?
        if (trimmed.startsWith("DELETE FROM LEASES")) {
            const [id] = params;
            const idx = this.leases.findIndex(l => l.id == id);
            if (idx === -1) {
                return callback.call({ changes: 0 }, null);
            }
            this.leases.splice(idx, 1);
            return callback.call({ changes: 1 }, null);
        }

        callback.call({ changes: 0 }, null);
    }

    get(sql, params, callback) {
        if (typeof params === "function") {
            callback = params;
            params = [];
        }
        params = params || [];
        callback = callback || (() => {});

        const trimmed = sql.trim().toUpperCase();

        if (trimmed.includes("FROM GARDENERS WHERE ID = ?")) {
            const [id] = params;
            const row = this.gardeners.find(g => g.id == id);
            return callback(null, row ? { ...row } : undefined);
        }

        if (trimmed.includes("FROM PLOTS WHERE ID = ?")) {
            const [id] = params;
            const row = this.plots.find(p => p.id == id);
            return callback(null, row ? { ...row } : undefined);
        }

        if (trimmed.includes("FROM LEASES") && trimmed.includes("WHERE LEASES.ID = ?")) {
            const [id] = params;
            const lease = this.leases.find(l => l.id == id);
            if (!lease) return callback(null, undefined);
            const gardener = this.gardeners.find(g => g.id == lease.gardener_id) || {};
            const plot = this.plots.find(p => p.id == lease.plot_id) || {};
            return callback(null, {
                id: lease.id,
                gardener_id: lease.gardener_id,
                plot_id: lease.plot_id,
                gardener_name: gardener.name,
                plot_name: plot.name,
                start_date: lease.start_date,
                end_date: lease.end_date
            });
        }

        callback(null, undefined);
    }

    all(sql, params, callback) {
        if (typeof params === "function") {
            callback = params;
            params = [];
        }
        params = params || [];
        callback = callback || (() => {});

        const trimmed = sql.trim().toUpperCase();

        if (trimmed.includes("FROM PLOTS") && trimmed.includes("WHERE ID NOT IN")) {
            const [startDate, endDate] = params;
            const bookedPlotIds = new Set(
                this.leases
                    .filter(l => l.start_date <= startDate && l.end_date >= endDate)
                    .map(l => l.plot_id)
            );
            const available = this.plots.filter(p => !bookedPlotIds.has(p.id)).map(p => ({ ...p }));
            return callback(null, available);
        }

        if (trimmed.includes("FROM PLOTS WHERE SOIL = ?")) {
            const [soil] = params;
            const rows = this.plots.filter(p => p.soil === soil).map(p => ({ ...p }));
            return callback(null, rows);
        }

        if (trimmed.startsWith("SELECT * FROM PLOTS")) {
            return callback(null, this.plots.map(p => ({ ...p })));
        }

        if (trimmed.startsWith("SELECT * FROM GARDENERS")) {
            return callback(null, this.gardeners.map(g => ({ ...g })));
        }

        if (trimmed.includes("FROM LEASES") && trimmed.includes("JOIN GARDENERS")) {
            const rows = this.leases.map(lease => {
                const gardener = this.gardeners.find(g => g.id == lease.gardener_id) || {};
                const plot = this.plots.find(p => p.id == lease.plot_id) || {};
                return {
                    id: lease.id,
                    gardener_name: gardener.name,
                    plot_name: plot.name,
                    start_date: lease.start_date,
                    end_date: lease.end_date
                };
            });
            return callback(null, rows);
        }

        callback(null, []);
    }

    close(cb) {
        if (cb) cb();
    }
}

module.exports = MemoryDb;
