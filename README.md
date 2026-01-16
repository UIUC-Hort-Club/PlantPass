# PlantPass; UIUC Horticulture Club

## Todo for MVP
- Backend Database
    - Purchase Transactions (CRUD): Should have all data related to a transaction
    - Discounts (CRUD): Should have discount name and percent off
    - Products (CRUD): Should have the product name, SKU, and price

- Backend Functions
    - Transactions will come in as just items+quantities and club voucher. Backend logic should compute discount and create database entry. (Should log the discount and product data used as it maybe subject to change during the event)
        - Example:
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
    - Query analytics data from the purchases table
    - Endpoint to generate a .csv of all transactions

- Frontend (May need backend functionality)
    - Implement discount and product modifications
    - Admin password change (DONE)
    - Admin reset password ("I forgot my password")
    - Email receipt
    - Generate QR codes for scanning feature (Download pdf)

### Password authentication

Admins may change the password at will, but if the password is forgotten, this may be used to reset it.

Override Password (for reset): `uiuchortclub2026springplantfair`