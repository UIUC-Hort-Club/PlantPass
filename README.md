# PlantPass; UIUC Horticulture Club

## Todo for MVP
- Backend Database
    - Purchase Transactions (CRUD): Should have all data related to a transaction
    - Discounts (CRUD): Should have discount name and percent off
    - Products (CRUD): Should have the product name, SKU, and price

- Backend Functions
    - Transactions will come in as just items+quantities and club voucher. Backend logic should compute discount and create database entry. (Should log the discount and product data used as it maybe subject to change during the event)
    - Query analytics data from the purchases table
    - Endpoint to generate a .csv of all transactions

- Frontend (May need backend functionality)
    - Implement discount and product modifications
    - Admin password change (DONE)
    - Admin reset password ("I forgot my password")
    - Email receipt
    - Generate QR codes for scanning feature (Download pdf)

### API Endpoints to Implement
Admin Password - Allows management of admin authentication
- `POST /admin/login`
- `POST /admin/change-password`
- `POST /admin/reset-password`

Transaction Handler - Allows management of the transactions/purchases database
- `POST /transactions`: Create a transaction – Creates a new purchase record in the database using the provided Transaction Schema.
- `GET /transactions/{purchase_id}`: Read a transaction – Retrieves a transaction record associated with the given purchase_id.
- `PUT /transactions/{purchase_id}`: Update a transaction – Replaces an existing transaction with the data provided in the request body. The purchase_id in the path identifies the record to update.
- `DELETE /transactions/{purchase_id}`: Delete a transaction – Removes the transaction associated with the given purchase_id from the database.

Products Handler - Allows management of the products database
- `GET /products` – Get all products
Description: Retrieves the full list of products to display at the cashier.
Response Example:
```
[
  {
    "SKU": "SKU123",
    "item": "Red T-Shirt",
    "price_ea": 19.99
  },
  {
    "SKU": "SKU124",
    "item": "Blue T-Shirt",
    "price_ea": 21.99
  }
]
```
- `POST /products` – Create a product
- `PUT /products/{SKU}` – Update a product
- `DELETE /products/{SKU}` – Delete a product

Discounts Handler - Allows management of the discounts database
- `GET /discounts` – Get all discounts
Description: Retrieves the full list of active discounts for the cashier display.
Response Example:
```
[
  {
    "name": "Summer Sale",
    "percent_off": 25
  },
  {
    "name": "Clearance",
    "percent_off": 50
  }
]
```
- `POST /discounts` – Create a discount
- `PUT /discounts/{name}` – Update a discount
- `DELETE /discounts/{name}` – Delete a discount

### Transaction SCHEMA
```
{
    "payment": {
        "method": "string",
        "paid": true
    },
    "timestamp": 0,
    "purchase_id": "string",
    "items": [
        {
        "SKU": "SKU123",
        "item": "item name",
        "quantity": 0,
        "price_ea": 0.0
        }
    ],
    "discounts": [
        {
        "name": "discount name",
        "percent_off": 0,
        "amount_off": 0.0
        }
    ],
    "club_voucher": 0.0,
    "receipt": {
        "subtotal": 0.0,
        "discount": 0.0,
        "total": 0.0
    }
}
```

### Password authentication (wip)
Admins may change the password at will, but if the password is forgotten, this may be used to reset it.
Override Password (for reset): `uiuchortclub2026springplantfair`