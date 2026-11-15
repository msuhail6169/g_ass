SeedShare Garden API
A RESTful backend for managing gardeners, garden plots, and plot leases. The project is built with Node.js, Express.js, and SQLite, and provides CRUD operations, search, validation, and plot-availability checking.
Project Links
- Live API: https://g-ass-uch0.onrender.com
- GitHub Repository: https://github.com/msuhail6169/g_ass
Features
- Manage gardeners: create, view, update, and delete.
- Manage garden plots: create, view, update, and delete.
- Manage leases between gardeners and plots.
- Retrieve lease information with gardener and plot names.
- Search plots by soil type.
- Validate required fields and lease dates.
- Find plots available on a requested date.
Tech Stack
- Node.js
- Express.js
- SQLite
- Postman
- Git and GitHub
- Render (deployment)
Project Structure
seedshare/
├── routes/
│   ├── gardeners.js
│   ├── plots.js
│   └── leases.js
├── screenshots/
│   ├── 01-get-all-gardeners.png
│   ├── 02-add-gardener.png
│   ├── ...
│   └── 19-plot-available.png
├── app.js
├── database.js
├── seedshare.db
├── package.json
└── README.md
The screenshots/ directory contains the Postman screenshots for the 19 API requests listed below.
Setup and Run Locally
1. Clone the repository
git clone https://github.com/msuhail6169/g_ass.git
cd g_ass/seedshare
If the project files are in the repository root, run the remaining commands from that directory instead of seedshare.

2. Install dependencies
npm install
3. Start the server
node app.js
The local server runs on the port configured in app.js (commonly 3000).
API Endpoints
Use the deployed base URL:
https://g-ass-uch0.onrender.com
For local testing, replace it with your local server URL, such as http://localhost:3000.
Gardeners
Method	Endpoint	Description
GET	/gardeners	Get all gardeners
POST	/gardeners	Add a gardener
GET	/gardeners/:id	Get one gardener
PUT	/gardeners/:id	Update a gardener
DELETE	/gardeners/:id	Delete a gardener


Example request body for POST /gardeners:
{
  "name": "Test Gardener",
  "email": "gardener@example.com"
}
Plots
Method	Endpoint	Description
GET	/plots	Get all plots
POST	/plots	Add a plot
GET	/plots/:id	Get one plot
PUT	/plots/:id	Update a plot
DELETE	/plots/:id	Delete a plot
GET	/plots?soil=Clay	Search plots by soil type
GET	/plots/available?date=YYYY-MM-DD	Get plots available on a date


Example request body for POST /plots:
{
  "name": "Test Plot",
  "soil": "Clay"
}
Leases
Method	Endpoint	Description
GET	/leases	Get all leases with gardener and plot names
POST	/leases	Create a lease
GET	/leases/:id	Get one lease
PUT	/leases/:id	Update a lease
DELETE	/leases/:id	Delete a lease


Example request body:
{
  "gardener_id": 1,
  "plot_id": 1,
  "start_date": "2026-12-10",
  "end_date": "2026-12-12"
}
Postman API Test Collection
The Postman collection is named SeedShare API Testing. It contains 19 requests covering the main API operations and validation/availability scenarios.
Screenshot paths below assume the image files are saved inside the repository's screenshots/ folder. Keep the filenames exactly the same, including capitalization and spaces.

Gardeners
01. Get All Gardeners — GET /gardeners

Retrieves the list of gardeners.

02. Add Gardener — POST /gardeners

Creates a gardener using a name and unique email address.

03. Get One Gardener — GET /gardeners/:id

Retrieves a gardener by ID.

04. Update Gardener — PUT /gardeners/:id

Updates an existing gardener's details.

05. Delete Gardener — DELETE /gardeners/:id

Deletes a gardener by ID.

Plots
06. Get All Plots — GET /plots

Retrieves all garden plots.

07. Add Plot — POST /plots

Creates a plot with a name and soil type.

![07 - Add Plot](screenshots/07-Add Plot.png)

08. Get One Plot — GET /plots/:id

Retrieves a plot by ID.

09. Update Plot — PUT /plots/:id

Updates an existing plot.

10. Delete Plot — DELETE /plots/:id

Deletes a plot by ID.

11. Search Plots by Soil — GET /plots?soil=Clay

Filters plots by soil type using a query parameter.

Leases
12. Get All Leases — GET /leases

Retrieves leases with the associated gardener and plot names.

13. Add Lease — POST /leases

Creates a lease connecting an existing gardener and plot for a date range.

14. Get One Lease — GET /leases/:id

Retrieves one lease by ID, including related gardener and plot information.

15. Update Lease — PUT /leases/:id

Updates the gardener, plot, or date range for an existing lease.

16. Delete Lease — DELETE /leases/:id

Deletes a lease by ID.

Validation and Availability Tests
17. Invalid Lease Dates — POST /leases

Checks that a lease with an end date earlier than its start date is rejected with 400 Bad Request.

18. Plot Unavailable — GET /plots/available?date=2026-11-11

Checks the availability response for the requested date. For the assignment's required scenario, Plot 9 must be leased from 2026-11-10 through 2026-11-12, so it should not appear as available on 2026-11-11.

19. Plot Available — GET /plots/available?date=2026-11-13

Checks that a plot whose lease ended on 2026-11-12 is available again on 2026-11-13.

Validation and Expected Status Codes
Scenario	Expected status
Successful creation	201 Created
Successful retrieval	200 OK
Successful update	200 OK
Successful deletion	200 OK
Invalid or missing input	400 Bad Request
Requested record does not exist	404 Not Found


The lease date validation must reject an end date earlier than the start date. The availability endpoint must exclude plots whose lease period includes the requested date.
Important Testing Notes
- Use IDs returned by successful POST requests when testing GET, PUT, and DELETE.
- Use a unique email address when creating a gardener.
- Ensure the referenced gardener and plot exist before creating a lease.
- The required availability scenario should be tested with the exact Plot 9 lease dates: November 10–12, 2026; unavailable on November 11 and available on November 13, 2026.
- A screenshot documents the response shown at the time it was captured. Re-run a request if you need to verify the current live deployment result.
Author
Mohd Suhail

GitHub: https://github.com/msuhail6169
