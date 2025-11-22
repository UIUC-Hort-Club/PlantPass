# S3 Bucket
resource "aws_s3_bucket" "frontend" {
  bucket = "plantpass-frontend"
}

output "frontend_bucket_name" {
  value       = aws_s3_bucket.frontend.bucket
  description = "The S3 bucket for the frontend"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"
  comment             = "PlantPass React frontend"

  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-PlantPass"

    s3_origin_config {
      origin_access_identity = ""
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-PlantPass"
    viewer_protocol_policy = "redirect-to-https"

    # required
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# Terraform Backend
terraform {
  backend "s3" {
    bucket = "plantpass-terraform-state"      # your state bucket
    key    = "frontend/terraform.tfstate"     # path in the bucket for this project
    region = "us-east-1"
  }
}
