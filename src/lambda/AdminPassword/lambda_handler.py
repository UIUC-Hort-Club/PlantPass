import json
import logging
import os
import boto3
import bcrypt
import jwt
import datetime

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client("s3")
bucket = os.environ["PASSWORD_BUCKET"]
key = os.environ["PASSWORD_KEY"]

JWT_SECRET = os.environ["JWT_SECRET"]
RESET_TOKEN_HASH = os.environ.get("RESET_TOKEN_HASH")
RESET_ENABLED = os.environ.get("RESET_ENABLED") == "true"

def get_password_hash():
    logger.info("Fetching admin password hash from S3")
    logger.info(f"Bucket: {bucket}, Key: {key}")

    obj = s3.get_object(Bucket=bucket, Key=key)
    data = json.loads(obj["Body"].read())
    return data["admin_password_hash"].encode()

def set_password_hash(new_hash):
    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=json.dumps({"admin_password_hash": new_hash.decode()})
    )

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")

    try:
        body = json.loads(event.get("body", "{}"))
        route_key = event.get("routeKey", "")
        logger.info(f"Route key: {route_key}, Body: {body}")

        # ---- Admin login ----
        if route_key == "POST /admin/login":
            pw_hash = get_password_hash()
            password = body.get("password", "")

            logger.info(f"Received login attempt with password: {password} (REMOVE FOR PROD)")

            if bcrypt.checkpw(password.encode(), pw_hash):
                token = jwt.encode(
                    {"exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
                    JWT_SECRET,
                    algorithm="HS256"
                )
                return {"statusCode": 200, "body": json.dumps({"token": token})}
            return {"statusCode": 401, "body": json.dumps({"error": "Invalid password"})}
        
        # ---- Change password ----
        if route_key == "POST /admin/change-password":
            token = event["headers"].get("Authorization", "").replace("Bearer ", "")

            logger.info(f"Received token: {token}")

            try:
                jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            except jwt.ExpiredSignatureError:
                return {"statusCode": 401, "body": json.dumps({"error": "Token expired"})}
            except:
                return {"statusCode": 401, "body": json.dumps({"error": "Invalid token"})}

            old_pw = body.get("old_password", "")
            new_pw = body.get("new_password", "")

            pw_hash = get_password_hash()
            if not bcrypt.checkpw(old_pw.encode(), pw_hash):
                return {"statusCode": 401, "body": json.dumps({"error": "Invalid current password"})}

            new_hash = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt())
            set_password_hash(new_hash)
            return {"statusCode": 200, "body": json.dumps({"success": True})}

        # ---- Reset (Forgot) password ----
        if route_key == "POST/admin/reset-password":
            reset_token = event["headers"].get("X-Reset-Token", "")
            if not RESET_ENABLED:
                return {"statusCode": 404, "body": json.dumps({"error": "Password reset is disabled"})}
            if not bcrypt.checkpw(reset_token.encode(), RESET_TOKEN_HASH.encode()):
                return {"statusCode": 401, "body": json.dumps({"error": "Invalid reset token"})}

            new_pw = body.get("new_password", "")
            new_hash = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt())
            set_password_hash(new_hash)
            return {"statusCode": 200, "body": json.dumps({"success": True})}

        return {"statusCode": 404, "body": json.dumps({"error": "Route not found"})}

    except:
        logger.exception("Error processing request")
        return {"statusCode": 500, "body": json.dumps({"error": "Internal server error"})}
