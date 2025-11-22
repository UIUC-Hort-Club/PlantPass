import json
from database_interface import save_transaction, get_transaction, compute_total

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        route = event.get("path", "")

        # ---- Write transaction ----
        if route == "/write":
            save_transaction(body)
            return {
                "statusCode": 200,
                "body": json.dumps({"message": "Transaction recorded"})
            }

        # ---- Read transaction ----
        elif route == "/read":
            transaction_id = body.get("transactionId")
            if not transaction_id:
                return {"statusCode": 400, "body": json.dumps({"message": "transactionId required"})}
            
            transaction = get_transaction(transaction_id)
            return {
                "statusCode": 200,
                "body": json.dumps(transaction)
            }

        # ---- Compute total ----
        elif route == "/total":
            customer_id = body.get("customerId")  # optional
            total = compute_total(customer_id)
            return {
                "statusCode": 200,
                "body": json.dumps({"total": total})
            }

        # ---- Unknown route ----
        else:
            return {"statusCode": 404, "body": json.dumps({"message": "Route not found"})}

    except Exception as e:
        print(f"Error: {e}")
        return {"statusCode": 500, "body": json.dumps({"message": str(e)})}