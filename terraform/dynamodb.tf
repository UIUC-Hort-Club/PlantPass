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