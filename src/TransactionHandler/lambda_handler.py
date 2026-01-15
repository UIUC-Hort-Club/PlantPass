import json
import logging
from database_interface import save_transaction, get_transaction, compute_total

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")  # Log the raw event

    try:
        body = json.loads(event.get("body", "{}"))
        route_key = event.get("routeKey", "")
        logger.info(f"Route key: {route_key}, Body: {body}")

        # ---- Write transaction ----
        if route_key == "POST /write":
            logger.info("Processing /write request")
            try:
                full_transaction = save_transaction(body)
                logger.info(f"Transaction saved successfully: {full_transaction}")
            except Exception as e:
                logger.error(f"Error saving transaction: {e}", exc_info=True)
                return response(500, {"message": "Failed to save transaction"})
            
            return response(200, {"transaction": full_transaction})

        # ---- Read transaction ----
        elif route_key == "POST /read":
            transaction_id = body.get("transactionId")
            if not transaction_id:
                logger.warning("transactionId missing in /read request")
                return response(400, {"message": "transactionId required"})
            
            transaction = get_transaction(transaction_id)
            logger.info(f"Transaction retrieved: {transaction}")
            return response(200, transaction)

        # ---- Compute total ----
        elif route_key == "POST /total":
            customer_id = body.get("customerId")  # optional
            total = compute_total(customer_id)
            logger.info(f"Total computed: {total}")
            return response(200, {"total": total})

        # ---- Unknown route ----
        else:
            logger.warning(f"Unknown route: {route_key}")
            return response(404, {"message": "Route not found"})

    except Exception as e:
        logger.error(f"Error processing request: {e}", exc_info=True)
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
