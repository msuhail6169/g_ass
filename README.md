# SeedShare API

Community Garden Plot Sharing API built with Node.js, Express, and SQLite3.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```
   Or for development mode with nodemon:
   ```bash
   npm run dev
   ```

3. The server runs by default at `http://localhost:3000`.

## API Endpoints

### General
- `GET /` - Welcome message
- `GET /health` - Health check status

### Gardeners
- `GET /gardeners` - Get all gardeners
- `GET /gardeners/:id` - Get gardener by ID
- `POST /gardeners` - Register a new gardener (`{ "name": "...", "email": "..." }`)
- `PUT /gardeners/:id` - Update gardener (`{ "name": "...", "email": "..." }`)
- `DELETE /gardeners/:id` - Delete gardener

### Plots
- `GET /plots` - Get all plots (optional filter `?soil=Loam`)
- `GET /plots/:id` - Get plot by ID
- `GET /plots/available?date=YYYY-MM-DD` - Get available plots on a given date
- `POST /plots` - Register a new plot (`{ "name": "...", "soil": "..." }`)
- `PUT /plots/:id` - Update plot (`{ "name": "...", "soil": "..." }`)
- `DELETE /plots/:id` - Delete plot

### Leases
- `GET /leases` - Get all leases with gardener and plot details
- `GET /leases/:id` - Get lease by ID
- `POST /leases` - Create a new lease (`{ "gardener_id": 1, "plot_id": 1, "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" }`)
- `PUT /leases/:id` - Update lease details
- `DELETE /leases/:id` - Cancel / delete lease
