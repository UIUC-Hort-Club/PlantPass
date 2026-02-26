# PlantPass User Guide

## Overview

PlantPass is a point-of-sale system designed for the UIUC Horticulture Club's Spring Plant Fair. This guide covers all features available to staff members and administrators.

## Getting Started

Access PlantPass through your web browser at the provided URL. You'll see the PlantPass logo and two options:

- **Spring Plant Fair Staff**: Access the checkout station (may require a passphrase)
- **Customer**: Look up existing orders

Click the PlantPass logo at any time to return to the home screen. The settings icon (gear) in the top-right corner provides quick access to the staff interface and admin console.

### Staff Access

When accessing the staff checkout station, you may be prompted to enter a passphrase. This security feature can be enabled or disabled by administrators. Once you enter the correct passphrase, you won't need to enter it again until you close your browser.

**If you forget the passphrase:**
1. Click the settings icon (gear) in the top-right corner of the home screen
2. This takes you directly to the Admin Console at `/admin-console`
3. Enter the admin password (if password protection is enabled)
4. Navigate to "PlantPass Access" to view the current passphrase
5. Alternatively, disable the "Protect PlantPass Access" feature toggle to remove the passphrase requirement

The Admin Console is accessible from both the home screen and the PlantPass staff interface, ensuring you can always recover access even if the passphrase is forgotten.

## Main Features

### Order Entry (for plant sale checkers)

Create new customer orders by selecting products and applying discounts.

1. Select products from the items table by entering quantities
2. View the running subtotal as you add items
3. Enter a voucher amount if the customer has one (optional)
4. Select applicable discounts by checking the boxes
5. Enter the customer's email address (if enabled)
6. Click "Enter Order" to record the transaction
7. A unique Order ID will be displayed for the customer
8. Click "New Order" to start the next transaction

After entering an order, you can click "Update This Order" to modify it before starting a new order.

### Order Lookup (for plant sale cashiers)

Search for and modify existing orders that have not been completed.

1. Enter the Order ID in the search field (format: ABC-DEF)
2. Click "Lookup" to retrieve the order
3. Modify quantities, discounts, or voucher amounts as needed
4. Click "Update Order" to save changes
5. Select a payment method from the dropdown
6. Click "Complete Order" to finalize the transaction

#### Recent Unpaid Orders

The Order Lookup screen displays recent unpaid orders for quick access:

- A loading indicator appears while orders are being fetched
- Click any order in the list to load it immediately
- Use the settings icon to configure how many recent orders are displayed (0-20)
- Set to 0 to disable the recent orders display
- Orders show the Order ID, number of items, total amount, and timestamp

Completed orders are marked as view-only and cannot be modified. Orders can be deleted using the "Delete Order" button if needed.

### Navigation Menu

Access different sections using the menu icon (three horizontal lines) in the top right corner:

- Order Entry: Create new orders
- Order Lookup: Search and modify existing orders
- Admin Console: Access administrative features (may require password)

## Admin Features

Access the Admin Console by:
- Clicking the settings icon (gear) in the top-right corner of the home screen
- Clicking the person icon in the PlantPass staff interface

You may be prompted to enter the admin password (if password protection is enabled). The Admin Console is available at `/admin-console` and can be accessed independently of the PlantPass staff interface.

### Sales Analytics

View comprehensive sales data and performance metrics:

- Total Revenue: Sum of all completed sales
- Order Volume: Total number of orders
- Average Order Value: Mean transaction amount
- Units Sold: Total items sold across all orders
- Average Items per Order: Mean items per transaction
- Revenue Over Time: Line chart showing sales trends

Click "Refresh" to update the analytics with the latest data. The analytics automatically refresh when you return to the tab.

### Transaction Table

View all transactions with details including Order ID, timestamp, units sold, and total amount. The table displays 20 transactions per page with navigation controls at the bottom.

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
3. Reorder products by dragging the handle icon on the left side
4. Add new products using the "Add Product" button
5. Delete products using the trash icon
6. Click "Save" to update the product list

The lock icon shows whether products are currently being edited by another administrator. When locked, you cannot make changes until the other person finishes.

### Edit Discounts

Manage available discounts:

1. View current discounts in the table
2. Modify discount names, types (percentage or dollar amount), and values
3. Reorder discounts by dragging the handle icon
4. Toggle between percentage (%) and dollar ($) discount types
5. Add new discounts using the "Add Discount" button
6. Delete discounts using the trash icon
7. Click "Save" to update the discount list

Discount types:
- Percentage: Discount calculated as a percentage of the subtotal
- Dollar: Fixed dollar amount deducted from the subtotal

The lock icon shows whether discounts are currently being edited by another administrator.

### Edit Payment Methods

Manage available payment options:

1. View current payment methods in the table
2. Modify payment method names by editing the fields
3. Reorder payment methods by dragging the handle icon
4. Add new payment methods using the "Add Payment Method" button
5. Delete payment methods using the trash icon
6. Click "Save" to update the payment method list

Common payment methods include Cash, Credit/Debit, Check, and Venmo.

### Feature Toggles

Control application behavior with these settings:

**Collect Email Addresses**
- When enabled: Customers can provide their email address during checkout
- When disabled: Email field is hidden and not collected

**Password Protect Admin Console**
- When enabled: Requires password to access admin features
- When disabled: Admin console is immediately accessible

**Protect PlantPass Access**
- When enabled: Requires passphrase to access the staff checkout station
- When disabled: Anyone can access the checkout station from the home screen

Click "Save Changes" after adjusting any toggles. Changes take effect immediately across all open browser tabs.

### PlantPass Access

Set the passphrase required to access the staff checkout station (when protection is enabled):

1. Enter the desired passphrase in the password field
2. Click the eye icon to show/hide the passphrase as you type
3. Click "Save Passphrase" to update

This passphrase is separate from the admin password and is used to restrict access to the checkout station.

**Important:** If staff members forget the passphrase, they can click the settings icon on the home screen to access the Admin Console directly at `/admin-console`, where they can view or reset the passphrase without needing to access the PlantPass staff interface first.

### Reset Password

Change the admin password:

1. Enter the current password
2. Enter the new password
3. Confirm the new password
4. Click "Update Password" to save

Use the eye icon next to each password field to show or hide what you're typing.

If you forget your password, click "Forgot Password?" and enter your email address to receive a password reset link.

## Customer Order Lookup

Customers can look up their orders without staff assistance:

1. From the home screen, click "Customer"
2. Enter the Order ID provided at checkout
3. Click "Search" to view the receipt
4. The receipt shows all items, discounts, and the total amount

Customers can also access their order directly by visiting the URL with their order ID: `hortclubplantpass.org/orders?id=ABC-DEF`

## Troubleshooting

If you encounter issues:

- Click the PlantPass logo to return to the home screen
- Refresh the page to reload data
- Check your internet connection
- Verify the Order ID format when looking up transactions (ABC-DEF)
- If you see a lock icon, another administrator is currently editing that section
- Contact the developer if problems persist

## Contact

For technical support or questions about PlantPass:

Joseph (Joe) Ku  
josephku825@gmail.com
