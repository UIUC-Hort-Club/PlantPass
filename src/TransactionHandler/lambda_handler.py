import json
from database_interface import save_transaction, get_transaction, compute_total

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        route_key = event.get("routeKey", "")  # <-- use this instead of "path"

        # ---- Write transaction ----
        if route_key == "POST /write":
            save_transaction(body)
            return response(200, {"message": "Transaction recorded"})

        # ---- Read transaction ----
        elif route_key == "POST /read":
            transaction_id = body.get("transactionId")
            if not transaction_id:
                return response(400, {"message": "transactionId required"})
            
            transaction = get_transaction(transaction_id)
            return response(200, transaction)

        # ---- Compute total ----
        elif route_key == "POST /total":
            customer_id = body.get("customerId")  # optional
            total = compute_total(customer_id)
            return response(200, {"total": total})

        # ---- Unknown route ----
        else:
            return response(404, {"message": "Route not found"})

    except Exception as e:
        print(f"Error: {e}")
        return response(500, {"message": str(e)})

def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        "body": json.dumps(body)
    }
