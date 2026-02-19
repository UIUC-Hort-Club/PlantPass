# PlantPass User Guide

## Overview

PlantPass is a point-of-sale system designed for the UIUC Horticulture Club's Spring Plant Fair. This guide covers all features available to cashiers and administrators.

## Getting Started

Access PlantPass through your web browser at the provided URL. The application displays the PlantPass logo at the top with navigation controls.

## Main Features

### Order Entry

Create new customer orders by selecting products and applying discounts.

1. Select products from the items table by entering quantities
2. View the running subtotal as you add items
3. Enter a voucher amount if the customer has one (optional)
4. Select applicable discounts by checking the boxes
5. Click "Enter" to record the transaction
6. A unique Order ID will be displayed for the customer
7. Click "New Order" to start the next transaction

After entering an order, you can click "Update This Order" to modify it before starting a new order.

### Order Lookup

Search for and modify existing orders that have not been completed.

1. Enter the Order ID in the search field (format: ABC1234)
2. Click "Lookup" to retrieve the order
3. Modify quantities, discounts, or voucher amounts as needed
4. Click "Update Order" to save changes
5. Select a payment method from the dropdown
6. Click "Complete Order" to finalize the transaction

The Order Lookup screen also displays recent unpaid orders for quick access. Click any order in the list to load it immediately. Use the gear icon to configure how many recent orders are displayed (0-20).

Completed orders are marked as view-only and cannot be modified. Orders can be deleted using the "Delete Order" button if needed.

### Navigation Menu

Access different sections of the application using the menu icon (three horizontal lines) in the top right corner:

- Order Entry: Create new orders
- Order Lookup: Search and modify existing orders
- Admin Console: Access administrative features (requires password)

## Admin Features

Click the person icon in the top right corner to access the Admin Console. You will be prompted to enter the admin password.

### Sales Analytics

View comprehensive sales data and performance metrics:

- Total Revenue: Sum of all completed sales
- Order Volume: Total number of orders
- Average Order Value: Mean transaction amount
- Units Sold: Total items sold across all orders
- Average Items per Order: Mean items per transaction
- Revenue Over Time: Line chart showing sales trends

Click "Refresh" to update the analytics with the latest data.

### Transaction Table

View all transactions with details including Order ID, timestamp, units sold, and total amount. The table displays 20 transactions per page with pagination controls at the bottom.

### Export Data

Download all transaction data as a ZIP file containing three CSV files:

1. transactions.csv: Summary of each transaction including totals and payment information
2. transaction_items.csv: Individual line items from each order
3. transaction_discounts.csv: Discounts applied to each transaction

Click the info icon next to "Export Data" for detailed information about the export format.

### Clear Records

Permanently delete all transaction records from the system. This action cannot be undone and requires typing "DELETE ALL" to confirm.

### Edit Products

Manage the product catalog:

1. View current products in the table
2. Modify product names, SKUs, or prices by editing the fields
3. Reorder products using drag handles on the left side
4. Add new products using the "Add Product" button
5. Delete products using the trash icon
6. Click "Save Changes" to update the product list

Changes are saved to the database and will be reflected immediately in Order Entry.

### Edit Discounts

Manage available discounts:

1. View current discounts in the table
2. Modify discount names, types (percentage or fixed), and values
3. Reorder discounts using drag handles
4. Add new discounts using the "Add Discount" button
5. Delete discounts using the trash icon
6. Click "Save Changes" to update the discount list

Discount types:
- Percentage: Discount calculated as a percentage of the subtotal
- Fixed: Flat dollar amount deducted from the subtotal

### Reset Password

Change the admin password:

1. Enter the current password
2. Enter the new password
3. Confirm the new password
4. Click "Reset Password" to save

## Payment Methods

When completing an order in Order Lookup, select from the following payment methods:

- Cash
- Credit/Debit
- Check
- Other

A payment method must be selected before an order can be completed.

## Tips for Efficient Use

- Use the recent orders list in Order Lookup for quick access to unpaid transactions
- Keep the Order Entry screen open during busy periods for faster checkout
- Export data regularly to maintain backup records
- Use vouchers for club members or special promotions
- Apply discounts before completing the order to ensure accurate totals

## Troubleshooting

If you encounter issues:

- Refresh the page to reload data
- Check your internet connection
- Verify the Order ID format when looking up transactions
- Contact the administrator if problems persist

## Contact

For technical support or questions about PlantPass:

Joseph (Joe) Ku  
josephku825@gmail.com
