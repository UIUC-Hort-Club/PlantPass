# -------------------------
# DynamoDB Tables
# -------------------------

# Discounts Table
resource "aws_dynamodb_table" "discounts" {
  name         = "discounts"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "name"

  attribute {
    name = "name"
    type = "S"
  }

  tags = {
    application = "plantpass"
  }
}

# Products Table
resource "aws_dynamodb_table" "products" {
  name         = "products"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "SKU"

  attribute {
    name = "SKU"
    type = "S"
  }

  tags = {
    application = "plantpass"
  }
}

# Transactions Table
resource "aws_dynamodb_table" "transactions" {
  name         = "transactions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "purchase_id"

  attribute {
    name = "purchase_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  # GSI for querying by timestamp (useful for analytics)
  global_secondary_index {
    name     = "timestamp-index"
    hash_key = "timestamp"
  }

  tags = {
    application = "plantpass"
  }
}