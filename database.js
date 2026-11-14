const path = require("path");
const MemoryDb = require("./memory_db");

let db;

// On Vercel serverless, native sqlite3 C++ binaries cannot be loaded by AWS Lambda.
// Use pure JS MemoryDb on Vercel, and native sqlite3 locally and on Render.
if (process.env.VERCEL) {
    console.log("Running on Vercel: Using serverless memory database");
    db = new MemoryDb();
} else {
    try {
        const sqlite3 = require("sqlite3").verbose();
        const dbPath = path.join(__dirname, "seedshare.db");
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error("Database connection failed:", err.message);
            } else {
                console.log("Connected to SeedShare SQLite database");
            }
        });

        db.serialize(() => {
            db.run("PRAGMA foreign_keys = ON");
            db.run(`
                CREATE TABLE IF NOT EXISTS gardeners (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL
                )
            `);
            db.run(`
                CREATE TABLE IF NOT EXISTS plots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    soil TEXT NOT NULL
                )
            `);
            db.run(`
                CREATE TABLE IF NOT EXISTS leases (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    gardener_id INTEGER NOT NULL,
                    plot_id INTEGER NOT NULL,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    FOREIGN KEY (gardener_id) REFERENCES gardeners(id),
                    FOREIGN KEY (plot_id) REFERENCES plots(id)
                )
            `);
            console.log("All database tables are ready!");
        });
    } catch (e) {
        console.warn("Failed to load native sqlite3, falling back to serverless memory database:", e.message);
        db = new MemoryDb();
    }
}

module.exports = db;
