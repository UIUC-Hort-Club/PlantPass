from utils import generate_random_id, validate_transaction_id

# TODO @maahum: Implement the record creation for this function.
#               All fields in the full transaction data should
#               be stored in the database, or be able to be
#               derived from it.
def create_transaction(transaction):
    """
    Create the transaction in the database

    ----------
    This expects a transaction object with the following structure:
    {
        "timestamp": 0,
        "items": [
        {
            "SKU": "SKU123",
            "item": "Plant A",
            "quantity": 2,
            "price_ea": 10.00
        },
        "voucher": 10     // This is the dollar amount of the voucher, not a percentage
    }

    ----------
    Returns the full transaction data from the backend, which includes discounts applied, etc.

    Example of full transaction data returned:
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
    """
    # Initialize blank transaction object and populate with expected fields
    transaction_created = {}

    # Init payment info - will be updated after payment processing
    transaction_created["payment"] = {
        "method": "",
        "paid": False
    }

    # Copy over timestamp and items from input transaction
    transaction_created["timestamp"] = transaction.get("timestamp", 0)

    # Generate a unique purchase ID using capital letters (in the form ___-___. For example, ABC-DEF)
    while True:
        purchase_id = generate_random_id()
        if validate_transaction_id(purchase_id):
            break
    transaction_created["purchase_id"] = purchase_id

    # Add items to the transaction
    transaction_created["items"] = transaction.get("items", [])

    # Add discounts
    #
    # Note: We pull these from the discounts endpoint and store them with this record in the off chance
    # that the discount details change in the future. This way we can always know exactly what discounts
    # were applied at the time of purchase. This is the same reason the product price is stored with the
    # transaction record instead of being pulled from the product database when needed.
    transaction_created["discounts"] = []

    # Add club voucher amount
    transaction_created["club_voucher"] = transaction.get("voucher", 0)

    # Compute receipt (subtotal, discount, total)
    subtotal = sum(item["quantity"] * item["price_ea"] for item in transaction_created["items"])
    total_discount = sum(discount.get("amount_off", 0) for discount in transaction_created["discounts"]) + transaction_created["club_voucher"]
    total = max(subtotal - total_discount, 0)  # Total should not be negative
    transaction_created["receipt"] = {
        "subtotal": subtotal,
        "discount": total_discount,
        "total": total
    }

    return transaction_created

# TODO @maahum: Implement the database read logic for this function.
#               Be sure to return the transaction in the same format as described in create_transaction, with all fields populated.
def read_transaction(transaction_id):
    """
    Retrieve a transaction by its ID.
    """
    return {}  # Replace with DB read logic

# TODO @maahum: Implement the database update logic for this function.
#               The use case here is that after order lookup, the customer
#               may choose to update the order or it was found that the
#               order details were incorrect and need to be updated. In
#               this case, we want to update the existing record in the
#               database with the new transaction data.
def update_transaction(transaction_id, updated_transaction):
    """
    Update an existing transaction with new data.
    """
    return {}  # Replace with DB update logic

# TODO @maahum: Implement the database delete logic for this function.
def delete_transaction(transaction_id):
    """
    Delete a transaction by its ID.
    """
    pass  # Replace with DB delete logic

# TODO @joe: Scope out the sales analytics that would be useful to compute
def compute_sales_analytics():
    """
    Compute sales analytics such as total sales, average order value, etc.
    """
    return {}  # Replace with actual computation logic

# TODO @maahum/joe: Implement the export data logic for this function.
#                   This should return a list of all transactions in a
#                   format suitable for export.
#
# Note: Not a priority for MVP. May need discovery since we need to push to s3 and
#       generate a presigned url for download instead of returning the data directly from this function if the data is large.
def export_transaction_data():
    """
    Export all transaction data in a format suitable for export (e.g., CSV, JSON).
    """
    return []  # Replace with actual export logic