#!/usr/bin/env python3
"""
Script to seed the payment_methods DynamoDB table with default payment methods.
Run this after deploying the infrastructure for the first time.

Usage:
    python scripts/seed-payment-methods.py
"""

import boto3
from decimal import Decimal

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('payment_methods')

# Default payment methods
default_payment_methods = [
    {"name": "Cash", "sort_order": 1},
    {"name": "Credit/Debit", "sort_order": 2},
    {"name": "Check", "sort_order": 3},
    {"name": "Other", "sort_order": 4},
]

def seed_payment_methods():
    """Seed the payment_methods table with default values."""
    print("Seeding payment_methods table...")
    
    for method in default_payment_methods:
        try:
            table.put_item(Item=method)
            print(f"✓ Added payment method: {method['name']}")
        except Exception as e:
            print(f"✗ Error adding {method['name']}: {e}")
    
    print("\nSeeding complete!")

if __name__ == "__main__":
    seed_payment_methods()
