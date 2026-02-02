# Restaurant App Project

## Project summary

This repository implements a multi-tenant restaurant menu application with two web UIs:

- `restaurant-menu-frontend/`: customer-facing menu viewer. Customers visit a URL like `/{restaurantId}` (often via QR code) to view that restaurant’s menu.
- `restaurant-menu-admin/`: admin portal where restaurant staff log in at `/admin/:restaurantId` and create/update/delete menu items for their restaurant.

The backend (`backend/`) is written in Python and designed to run on AWS Lambda behind API Gateway. It uses DynamoDB for persistence:

- `restaurant-app-db`: menu items (`id`, `restaurant-id`, `title`, `price`) with primary key `id`.
- `restaurant-app-admin-db`: admin credentials (email/password per restaurant).

Infrastructure is deployed with the Serverless Framework. The current deployment uses three API Gateways (each with multiple routes).


## Architecture diagram (ASCII)

```text
 +---------------------+                 +-------------------------+
 |  Customer Browser   |                 |     Admin Browser       |
 | (menu viewer UI)    |                 |  (admin portal UI)      |
 +----------+----------+                 +------------+------------+
            |                                         |
            v                                         v
 +---------------------+                 +-------------------------+
 | Static Web Hosting  |                 |   Static Web Hosting    |
 | Menu Viewer App     |                 |    Admin Portal App     |
 | URL: /{restaurantId}|                 |  URL: /admin/{id}       |
 +----------+----------+                 +------------+------------+
            |                                         |
            | GET ?id={restaurantId}                   | POST /login
            v                                         v
 +---------------------------+          +---------------------------+
 | API Gateway #1            |          | API Gateway #3            |
 | Route: /restaurant-app-   |          | Route: /login             |
 | get-items                 |          +-------------+-------------+
 +-------------+-------------+                        |
               |                                      v
               v                         +---------------------------+
 +---------------------------+           | Lambda (Python)            |
 | Lambda (Python)           |           | restaurant-app-login-      |
 | restaurant-app-get-items  |           | function                   |
 +-------------+-------------+           +-------------+-------------+
               |                                      |
               v                                      v
      +---------------------+                +------------------------+
      | DynamoDB            |                | DynamoDB               |
      | restaurant-app-db   |                | restaurant-app-admin-db|
      | menu items (PK: id) |                | admin credentials       |
      +---------------------+                +------------------------+

 Admin CRUD flow
  Admin Portal App
    | GET/PUT/PATCH/DELETE ?id={restaurantId}
    v
  API Gateway #2  ->  Lambda (Python) restaurant-app-crud-functions  ->  DynamoDB restaurant-app-db

 Notes
  - Demo auth is tracked client-side using browser localStorage per restaurantId.
  - Current deployment uses 3 API Gateways (each may expose multiple routes).
```

## Future improvements

- **Security / auth**
  - Enforce tenant authorisation server-side for CRUD (do not rely on browser `localStorage`).
  - Store hashed+salted passwords (e.g., bcrypt/argon2) in `restaurant-app-admin-db` and remove any test credentials from the UI.
  - Consider API Gateway authorisers (e.g., Cognito JWT authoriser) if evolving beyond a demo.

- **DynamoDB access patterns**
  - Replace `scan()` + client-side filtering with `query()` using a GSI on `restaurant-id`.
  - Return a flat list of items from the Lambda responses to remove the need for `flat(Infinity)` on the clients.

- **API design / robustness**
  - Normalise status codes and error payloads across Lambdas (the login flow currently uses a non-standard success status).
  - Add server-side validation for `restaurantId`, request bodies, and price formatting.
  - Standardise CORS and headers across all API Gateways.

- **Frontend maintainability**
  - Move hard-coded API URLs and hosted base URL into environment variables (`VITE_*`).
  - Refactor admin UI interactions to be state-driven (avoid direct DOM manipulation like `parentNode.remove()` and `contentEditable`).

- **DevEx / quality**
  - Add automated tests (pytest for Lambdas; Playwright/Cypress for UI smoke tests).
  - Add CI/CD to lint/test/build and deploy via Serverless Framework with separate environments.