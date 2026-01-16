from utils import generate_random_id, validate_transaction_id

def save_transaction(transaction):
    """
    Save the transaction to the database

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
    transaction_created["discounts"] = []  # Placeholder for any discounts applied (Pull from DB)

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

    return transaction_created  # Replace with DB write logic and return full transaction data


def get_transaction(transaction_id):
    """
    Retrieve a transaction by its ID.
    """
    return {}  # Replace with DB read logic


def compute_total(customer_id=None):
    """
    Sum totals for all transactions, or filter by customer_id if provided.
    """
    return 0  # Replace with DB aggregation logic
