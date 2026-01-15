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

variable "lambda_zip_path" {
  type        = string
  description = "Path to TransactionHandler Lambda ZIP relative to Terraform working directory"
}

variable "admin_lambda_zip_path" {
  type        = string
  description = "Path to AdminPassword Lambda ZIP relative to Terraform working directory"
}