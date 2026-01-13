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