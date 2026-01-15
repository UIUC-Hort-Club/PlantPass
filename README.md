# PlantPass; UIUC Horticulture Club

## Todo for MVPnpm
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
    - Admin password change
    - Email receipt
    - Generate QR codes for scanning feature (Download pdf)