# # ---------------------------------------------------------
# # ACM Certificate (must be in us-east-1 for CloudFront)
# # ---------------------------------------------------------

# provider "aws" {
#   alias  = "us_east_1"
#   region = "us-east-1"
# }

# resource "aws_acm_certificate" "cert" {
#   provider          = aws.us_east_1
#   domain_name       = var.domain_name
#   validation_method = "DNS"

#   subject_alternative_names = var.alternate_names

#   tags = {
#     application = "plantpass"
#   }
# }

# # ---------------------------------------------------------
# # DNS Validation Records (created in your Route53 zone)
# # ---------------------------------------------------------

# resource "aws_route53_record" "cert_validation" {
#   for_each = {
#     for dvo in aws_acm_certificate.cert.domain_validation_options :
#     dvo.domain_name => {
#       name   = dvo.resource_record_name
#       record = dvo.resource_record_value
#       type   = dvo.resource_record_type
#     }
#   }

#   zone_id = aws_route53_zone.main.zone_id
#   name    = each.value.name
#   type    = each.value.type
#   ttl     = 60
#   records = [each.value.record]
# }

# resource "aws_acm_certificate_validation" "cert" {
#   provider                = aws.us_east_1
#   certificate_arn         = aws_acm_certificate.cert.arn
#   validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
# }
