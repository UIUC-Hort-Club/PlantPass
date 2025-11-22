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
