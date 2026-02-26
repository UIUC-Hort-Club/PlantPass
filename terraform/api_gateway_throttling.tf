# API Gateway Throttling Configuration
# Prevents abuse and ensures fair usage during high-traffic events

# Default throttling settings for all routes
resource "aws_api_gateway_method_settings" "default_throttling" {
  count       = var.enable_api_throttling ? 1 : 0
  rest_api_id = aws_api_gateway_rest_api.plantpass_api.id
  stage_name  = aws_api_gateway_stage.production.stage_name
  method_path = "*/*"

  settings {
    # Burst limit: Maximum concurrent requests
    throttling_burst_limit = 100
    
    # Rate limit: Requests per second
    throttling_rate_limit = 50
    
    # Enable CloudWatch metrics
    metrics_enabled = true
    logging_level   = "INFO"
    
    # Enable caching for GET requests
    caching_enabled = true
    cache_ttl_in_seconds = 300  # 5 minutes
    cache_data_encrypted = true
  }
}

# Stricter limits for admin operations
resource "aws_api_gateway_method_settings" "admin_throttling" {
  count       = var.enable_api_throttling ? 1 : 0
  rest_api_id = aws_api_gateway_rest_api.plantpass_api.id
  stage_name  = aws_api_gateway_stage.production.stage_name
  method_path = "admin/*"

  settings {
    throttling_burst_limit = 20
    throttling_rate_limit = 10
    metrics_enabled = true
    logging_level   = "INFO"
  }
}

# More lenient limits for public order lookup
resource "aws_api_gateway_method_settings" "public_throttling" {
  count       = var.enable_api_throttling ? 1 : 0
  rest_api_id = aws_api_gateway_rest_api.plantpass_api.id
  stage_name  = aws_api_gateway_stage.production.stage_name
  method_path = "transactions/*/GET"

  settings {
    throttling_burst_limit = 200
    throttling_rate_limit = 100
    metrics_enabled = true
    caching_enabled = true
    cache_ttl_in_seconds = 60  # 1 minute for order lookups
  }
}

# Cache settings for products and discounts (rarely change)
resource "aws_api_gateway_method_settings" "catalog_caching" {
  count       = var.enable_api_throttling ? 1 : 0
  rest_api_id = aws_api_gateway_rest_api.plantpass_api.id
  stage_name  = aws_api_gateway_stage.production.stage_name
  method_path = "products/GET"

  settings {
    caching_enabled = true
    cache_ttl_in_seconds = 600  # 10 minutes
    cache_data_encrypted = true
    metrics_enabled = true
  }
}

# Variables
variable "enable_api_throttling" {
  description = "Enable API Gateway throttling and caching"
  type        = bool
  default     = true
}

# Outputs
output "api_throttling_enabled" {
  description = "Whether API throttling is enabled"
  value       = var.enable_api_throttling
}
