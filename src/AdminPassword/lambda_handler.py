import json
import logging
import os
import boto3
import bcrypt
import jwt
import datetime

s3 = boto3.client("s3")
bucket = os.environ["PASSWORD_BUCKET"]
key = os.environ["PASSWORD_KEY"]
JWT_SECRET = os.environ["JWT_SECRET"]

def get_password_hash():
    logging.info("Fetching admin password hash from S3")
    logging.info(f"Bucket: {bucket}, Key: {key}")

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
    route = event.get("path")
    body = json.loads(event.get("body", "{}"))

    if route == "/admin/login":
        logging.info(f"Received login attempt with password: {password} (REMOVE FOR PROD)")

        pw_hash = get_password_hash()
        password = body.get("password", "")

        if bcrypt.checkpw(password.encode(), pw_hash):
            token = jwt.encode(
                {"exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
                JWT_SECRET,
                algorithm="HS256"
            )
            return {"statusCode": 200, "body": json.dumps({"token": token})}
        return {"statusCode": 401, "body": json.dumps({"error": "Invalid password"})}

    if route == "/change-password":
        token = event["headers"].get("Authorization", "").replace("Bearer ", "")
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

    return {"statusCode": 404, "body": json.dumps({"error": "Not found"})}
