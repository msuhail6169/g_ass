# API Testing & Screenshots

All API endpoints were tested using Postman against the deployed application on Vercel.

The following sections document each API request, its purpose, and its corresponding test result.

## 1. Get All Gardeners

- **Method:** GET
- **Endpoint:** `/gardeners`
- **Description:** Retrieves all gardeners from the database.

![Get All Gardeners](screenshots/01-get-all-gardeners.png)

## 2. Add Gardener

- **Method:** POST
- **Endpoint:** `/gardeners`
- **Description:** Creates a new gardener using the provided name and email.

![Add Gardener](screenshots/02-add-gardener.png)

## 3. Get One Gardener

- **Method:** GET
- **Endpoint:** `/gardeners/:id`
- **Description:** Retrieves the details of a specific gardener using their ID.

![Get One Gardener](screenshots/03-get-one-gardener.png)

## 4. Update Gardener

- **Method:** PUT
- **Endpoint:** `/gardeners/:id`
- **Description:** Updates the details of an existing gardener.

![Update Gardener](screenshots/04-update-gardener.png)

## 5. Delete Gardener

- **Method:** DELETE
- **Endpoint:** `/gardeners/:id`
- **Description:** Deletes a gardener from the database.

![Delete Gardener](screenshots/05-delete-gardener.png)

## 6. Get All Plots

- **Method:** GET
- **Endpoint:** `/plots`
- **Description:** Retrieves all available plot records from the database.

![Get All Plots](screenshots/06-get-all-plots.png)

## 7. Get One Plot

- **Method:** GET
- **Endpoint:** `/plots/:id`
- **Description:** Retrieves a specific plot using its ID.

![Get One Plot](screenshots/08-get-one-plot.png)

## 8. Update Plot

- **Method:** PUT
- **Endpoint:** `/plots/:id`
- **Description:** Updates the details of an existing plot.

![Update Plot](screenshots/09-update-plot.png)

## 9. Delete Plot

- **Method:** DELETE
- **Endpoint:** `/plots/:id`
- **Description:** Deletes a plot from the database.

![Delete Plot](screenshots/10-delete-plot.png)

## 10. Search Plots by Soil

- **Method:** GET
- **Endpoint:** `/plots?soil=Clay`
- **Description:** Filters plots based on their soil type.

![Search Plots by Soil](screenshots/11-search-plots.png)

## 11. Get All Leases

- **Method:** GET
- **Endpoint:** `/leases`
- **Description:** Retrieves all lease records, including associated gardener and plot information.

![Get All Leases](screenshots/12-get-all-leases.png)

## 12. Add Lease

- **Method:** POST
- **Endpoint:** `/leases`
- **Description:** Creates a lease by providing gardener ID, plot ID, start date and end date.

![Add Lease](screenshots/13-add-lease.png)

## 13. Get One Lease

- **Method:** GET
- **Endpoint:** `/leases/:id`
- **Description:** Retrieves a specific lease with its associated gardener and plot details.

![Get One Lease](screenshots/14-get-one-lease.png)

## 14. Update Lease

- **Method:** PUT
- **Endpoint:** `/leases/:id`
- **Description:** Updates the details and date range of an existing lease.

![Update Lease](screenshots/15-update-lease.png)

## 15. Delete Lease

- **Method:** DELETE
- **Endpoint:** `/leases/:id`
- **Description:** Deletes an existing lease record.

![Delete Lease](screenshots/16-delete-lease.png)

## 16. Invalid Lease Dates

- **Method:** POST
- **Endpoint:** `/leases`
- **Description:** Tests date validation by providing an end date earlier than the start date.

**Expected Result:** The API rejects the request with a validation error.

![Invalid Lease Dates](screenshots/17-invalid-lease-dates.png)

## 17. Plot Unavailable

- **Method:** GET
- **Endpoint:** `/plots/available?date=2026-11-11`
- **Description:** Tests the plot availability endpoint for a specified date.

![Plot Unavailable](screenshots/18-plot-unavailable.png)

## 18. Plot Available

- **Method:** GET
- **Endpoint:** `/plots/available?date=2026-12-25`
- **Description:** Tests the plot availability endpoint for another specified date.

![Plot Available](screenshots/19-plot-available.png)

---

**Note:** Screenshots document the actual API responses obtained during testing. The availability logic should also be verified using occupied and unoccupied plots.
