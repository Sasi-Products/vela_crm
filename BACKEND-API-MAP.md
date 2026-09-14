# Backend API Map used by this Web Panel

Base URL defaults to `http://localhost:8080/api`.

## Auth
- POST `/auth/login`
- GET `/auth/profile`
- PUT `/auth/change-password`

## Units
- POST `/units`
- GET `/units`
- GET `/units/:id`
- PUT `/units/:id`
- PUT `/units/:id/status`
- DELETE `/units/:id`

## Users
- POST `/admins`
- GET `/admins?role=all|admin|employee`
- GET `/admins/:id`
- PUT `/admins/:id`
- PUT `/admins/:id/status`
- PUT `/admins/:id/reset-password`
- GET `/admins/permissions/catalog` (permission-enabled backend)
- PUT `/admins/:id/permissions` (permission-enabled backend)

## Parties
- POST `/parties`
- GET `/parties`
- GET `/parties/:id`
- PUT `/parties/:id`

## Items
- POST `/items`
- GET `/items`
- GET `/items/stock-summary`
- GET `/items/:id`
- PUT `/items/:id`
- DELETE `/items/:id`

## Price Lists
- POST `/price-lists`
- GET `/price-lists`
- GET `/price-lists/:id`
- PUT `/price-lists/:id`
- DELETE `/price-lists/:id`

## Outward DC
- POST `/dc`
- GET `/dc`
- GET `/dc/:id`
- PUT `/dc/:id`
- POST `/dc/:id/approve`
- POST `/dc/:id/reject`
- POST `/dc/:id/convert-to-invoice` (multipart; Tally invoice link/PDF)

## Purchase DC / Inward
- POST `/inwards`
- GET `/inwards`
- GET `/inwards/:id`
- PUT `/inwards/:id`
- POST `/inwards/:id/approve`
- POST `/inwards/:id/reject`
- POST `/inwards/:id/invoice-attachment` (multipart; supplier PDF)

## Tally Invoices
- GET `/invoices`
- GET `/invoices/:id`
- POST `/invoices/:id/attachment`
- POST `/invoices/:id/cancel`

## Dashboard / Stock / Audit
- GET `/dashboard`
- GET `/dashboard/stock-ledger`
- GET `/dashboard/audit-logs`
