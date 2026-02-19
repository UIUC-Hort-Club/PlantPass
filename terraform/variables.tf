variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "frontend_bucket_name" {
  type    = string
  default = "plantpass-frontend"
}

variable "terraform_state_bucket" {
  type    = string
  default = "plantpass-terraform-state"
}

variable "domain_name" {
  type = string
}

variable "alternate_names" {
  type    = list(string)
  default = []
}

variable "transaction_lambda_zip_path" {
  type        = string
  description = "Path to TransactionHandler Lambda ZIP relative to Terraform working directory"
}

variable "admin_lambda_zip_path" {
  type        = string
  description = "Path to AdminPassword Lambda ZIP relative to Terraform working directory"
}

variable "products_lambda_zip_path" {
  type        = string
  description = "Path to ProductsHandler Lambda ZIP relative to Terraform working directory"
}

variable "discounts_lambda_zip_path" {
  type        = string
  description = "Path to DiscountsHandler Lambda ZIP relative to Terraform working directory"
}

variable "auth_layer_zip_path" {
  type = string
}

variable "reset_token_hash" {
  type      = string
  sensitive = true
}

variable "enable_custom_domain" {
  type        = bool
  default     = true
  description = "Set to true after ACM certificate is validated in Cloudflare"
}
