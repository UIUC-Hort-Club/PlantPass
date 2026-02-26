# DynamoDB Global Secondary Index for Unpaid Transactions
# Eliminates expensive table scans for recent unpaid orders query

resource "aws_dynamodb_table" "transactions_with_gsi" {
  name           = "plantpass-transactions"
  billing_mode   = "PAY_PER_REQUEST"  # Auto-scaling for event-based traffic
  hash_key       = "purchase_id"

  attribute {
    name = "purchase_id"
    type = "S"
  }

  attribute {
    name = "payment_status"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  # Global Secondary Index for querying unpaid transactions by timestamp
  global_secondary_index {
    name            = "PaymentStatusTimestampIndex"
    hash_key        = "payment_status"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  # Enable point-in-time recovery for data protection
  point_in_time_recovery {
    enabled = true
  }

  # Enable encryption at rest
  server_side_encryption {
    enabled = true
  }

  # Enable TTL for automatic cleanup of old transactions (optional)
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name        = "PlantPass Transactions"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

# CloudWatch alarm for high read capacity
resource "aws_cloudwatch_metric_alarm" "transactions_read_throttle" {
  alarm_name          = "plantpass-transactions-read-throttle"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "UserErrors"
  namespace           = "AWS/DynamoDB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "Alert when DynamoDB read requests are throttled"
  alarm_actions       = []  # Add SNS topic ARN for notifications

  dimensions = {
    TableName = aws_dynamodb_table.transactions_with_gsi.name
  }
}

# CloudWatch alarm for high write capacity
resource "aws_cloudwatch_metric_alarm" "transactions_write_throttle" {
  alarm_name          = "plantpass-transactions-write-throttle"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "WriteThrottleEvents"
  namespace           = "AWS/DynamoDB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "Alert when DynamoDB write requests are throttled"
  alarm_actions       = []  # Add SNS topic ARN for notifications

  dimensions = {
    TableName = aws_dynamodb_table.transactions_with_gsi.name
  }
}

output "transactions_table_name" {
  description = "Name of the transactions DynamoDB table"
  value       = aws_dynamodb_table.transactions_with_gsi.name
}

output "transactions_gsi_name" {
  description = "Name of the payment status GSI"
  value       = "PaymentStatusTimestampIndex"
}
