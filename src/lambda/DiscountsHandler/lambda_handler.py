# lambda_function.py

import json

def lambda_handler(event, context):
    # Minimal response
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "This is the Discounts Handler!"})
    }
