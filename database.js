const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
    path.join(__dirname, "seedshare.db"),
    (err) => {
        if (err) {
            console.error("Database connection failed:", err.message);
        } else {
            console.log("Connected to SeedShare SQLite database");
        }
    }
);

db.serialize(() => {
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON");

    // Gardeners Table
    db.run(`
        CREATE TABLE IF NOT EXISTS gardeners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        )
    `);

    // Plots Table
    db.run(`
        CREATE TABLE IF NOT EXISTS plots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            soil TEXT NOT NULL
        )
    `);

    // Leases Table
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

module.exports = db;
