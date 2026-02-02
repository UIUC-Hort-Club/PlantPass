import json
import logging
from datetime import datetime, timezone
from decimal import Decimal
from utils import generate_random_id, validate_transaction_id

logger = logging.getLogger()
logger.setLevel(logging.INFO)


class Transaction:
    """
    Transaction class that handles all business logic for transaction operations.
    
    This class can be created from JSON input (from API calls) or from database records,
    and provides methods to manipulate transaction data and convert to database format.
    """
    
    def __init__(self, data=None, source="json"):
        """
        Initialize a Transaction object.
        
        Args:
            data (dict): Transaction data
            source (str): "json" for API input, "db" for database record
        """
        self.data = data or {}
        self.source = source
        
        if source == "json":
            self._initialize_from_json()
        elif source == "db":
            self._initialize_from_db()
    
    def _initialize_from_json(self):
        """Initialize transaction from JSON input (API call)."""
        logger.info("Initializing transaction from JSON input")
        logger.info(f"Input data: {json.dumps(self.data, indent=2)}")
        
        # Could be slow as more transactions get written
        # implement caching?
        while True:
            purchase_id = generate_random_id()
            if validate_transaction_id(purchase_id):
                break
        
        self.purchase_id = purchase_id
        self.timestamp = self.data.get("timestamp", int(datetime.now(timezone.utc).timestamp()))
        self.items = self.data.get("items", [])
        self.input_discounts = self.data.get("discounts", [])
        self.club_voucher = self.data.get("voucher", 0)
        
        self.payment = {
            "method": "",
            "paid": False
        }
        
        self._process_discounts()
        self._calculate_receipt()
        
        logger.info(f"Transaction initialized with ID: {self.purchase_id}")
    
    def _initialize_from_db(self):
        """Initialize transaction from database record."""
        logger.info("Initializing transaction from database record")
        
        self.purchase_id = self.data.get("purchase_id")
        self.timestamp = self.data.get("timestamp")
        self.items = self.data.get("items", [])
        self.discounts = self.data.get("discounts", [])
        self.club_voucher = self.data.get("club_voucher", 0)
        self.payment = self.data.get("payment", {"method": "", "paid": False})
        self.receipt = self.data.get("receipt", {})
    
    def _process_discounts(self):
        """Process input discounts and calculate discount amounts."""
        logger.info("Processing discounts...")
        
        subtotal = self.get_subtotal()
        self.discounts = []
        
        for i, discount in enumerate(self.input_discounts):
            logger.info(f"Processing discount {i+1}/{len(self.input_discounts)}: {discount.get('name')}")
            
            discount_type = discount.get("type")
            selected = discount.get("selected", False)
            discount_value = discount.get("value", 0)
            
            logger.info(f"Discount details - Type: {discount_type}, Value: {discount_value}, Selected: {selected}")
            
            discount_record = {
                "name": discount.get("name"),
                "type": discount_type,
                "value": discount_value
            }
            
            if selected:
                if discount_type == "dollar":
                    discount_record["amount_off"] = discount_value
                    logger.info(f"Dollar discount applied: ${discount_value}")
                else:
                    discount_amount = (subtotal * discount_value) / 100
                    discount_record["amount_off"] = discount_amount
                    logger.info(f"Percent discount applied: {discount_value}% of ${subtotal} = ${discount_amount}")
            else:
                discount_record["amount_off"] = 0
                logger.info(f"Discount '{discount.get('name')}' not selected, amount_off = 0")
            
            self.discounts.append(discount_record)
            logger.info(f"Added discount record: {json.dumps(discount_record, indent=2)}")
    
    def _calculate_receipt(self):
        """Calculate receipt totals."""
        subtotal = self.get_subtotal()
        total_discount = self.get_total_discount()
        total = max(subtotal - total_discount, 0)
        
        self.receipt = {
            "subtotal": subtotal,
            "discount": total_discount,
            "total": total
        }
        
        logger.info(f"Receipt calculated: subtotal=${subtotal}, discount=${total_discount}, total=${total}")
    
    def get_subtotal(self):
        """Calculate subtotal from items."""
        return sum(item["quantity"] * item["price_ea"] for item in self.items)
    
    def get_total_discount(self):
        """Calculate total discount amount."""
        discount_amount = sum(discount.get("amount_off", 0) for discount in self.discounts)
        return discount_amount + self.club_voucher
    
    def update_items(self, new_items):
        """
        Update transaction items while preserving original pricing.
        
        Args:
            new_items (list): List of updated items
        """
        logger.info("Updating transaction items...")
        
        preserved_items = []
        for updated_item in new_items:
            sku = updated_item["SKU"]
            original_item = next((item for item in self.items if item["SKU"] == sku), None)
            
            if original_item:
                preserved_item = {
                    "SKU": sku,
                    "item": original_item["item"],
                    "quantity": updated_item["quantity"],
                    "price_ea": original_item["price_ea"]
                }
                logger.info(f"Preserving item {sku}: quantity {original_item['quantity']} -> {updated_item['quantity']}, price preserved at {original_item['price_ea']}")
                preserved_items.append(preserved_item)
            else:
                # New item
                logger.info(f"Adding new item {sku}: {updated_item}")
                preserved_items.append(updated_item)
        
        self.items = preserved_items
        self._recalculate_discounts_and_receipt()
    
    def update_discounts(self, new_discounts):
        """
        Update discount selections while preserving original discount rates.
        
        Args:
            new_discounts (list): List of updated discount selections
        """
        logger.info("Updating discount selections...")
        
        preserved_discounts = []
        subtotal = self.get_subtotal()
        
        for updated_discount in new_discounts:
            discount_name = updated_discount["name"]
            original_discount = next((d for d in self.discounts if d["name"] == discount_name), None)
            
            logger.info(f"Processing discount '{discount_name}'...")
            
            if original_discount:
                discount_record = {
                    "name": discount_name,
                    "type": original_discount["type"],
                    "value": original_discount["value"]
                }
                
                selected = updated_discount.get("selected", False)
                logger.info(f"Discount '{discount_name}': type={original_discount['type']}, value={original_discount['value']}, selected={selected}")
                
                if selected:
                    if original_discount["type"] == "dollar":
                        discount_record["amount_off"] = original_discount["value"]
                        logger.info(f"Dollar discount applied: ${original_discount['value']}")
                    else:
                        discount_amount = (subtotal * original_discount["value"]) / 100
                        discount_record["amount_off"] = discount_amount
                        logger.info(f"Percent discount applied: {original_discount['value']}% of ${subtotal} = ${discount_amount}")
                else:
                    discount_record["amount_off"] = 0
                    logger.info(f"Discount '{discount_name}' not selected, amount_off = 0")
                
                preserved_discounts.append(discount_record)
            else:
                # New discount
                logger.info(f"New discount '{discount_name}' added: {updated_discount}")
                preserved_discounts.append(updated_discount)
        
        self.discounts = preserved_discounts
        self._calculate_receipt()
    
    def update_voucher(self, voucher_amount):
        """Update club voucher amount."""
        old_voucher = self.club_voucher
        self.club_voucher = voucher_amount
        logger.info(f"Voucher updated: ${old_voucher} -> ${voucher_amount}")
        self._calculate_receipt()
    
    def update_payment(self, payment_info):
        """Update payment information."""
        logger.info(f"Payment info updated: {payment_info}")
        self.payment.update(payment_info)
    
    def _recalculate_discounts_and_receipt(self):
        """Recalculate discount amounts and receipt after item changes."""
        logger.info("Recalculating discounts after item changes...")
        
        subtotal = self.get_subtotal()
        
        for discount in self.discounts:
            if discount.get("amount_off", 0) > 0 and discount["type"] == "percent":
                discount_amount = (subtotal * discount["value"]) / 100
                discount["amount_off"] = discount_amount
                logger.info(f"Recalculated percent discount '{discount['name']}': {discount['value']}% of ${subtotal} = ${discount_amount}")
        
        self._calculate_receipt()
    
    def to_dict(self):
        """Convert transaction to dictionary format."""
        return {
            "purchase_id": self.purchase_id,
            "timestamp": self.timestamp,
            "items": self.items,
            "discounts": self.discounts,
            "club_voucher": self.club_voucher,
            "payment": self.payment,
            "receipt": self.receipt
        }
    
    def to_db_record(self):
        """
        Convert transaction to DynamoDB-compatible format.
        
        Returns:
            dict: Transaction data with Decimal types for DynamoDB
        """
        transaction_dict = self.to_dict()
        return json.loads(json.dumps(transaction_dict), parse_float=Decimal)
    
    @classmethod
    def from_json(cls, json_data):
        """
        Create Transaction from JSON input (API call).
        
        Args:
            json_data (dict): JSON data from API
        Returns:
            Transaction: New Transaction instance
        """
        return cls(json_data, source="json")
    
    @classmethod
    def from_db_record(cls, db_record):
        """
        Create Transaction from database record.
        
        Args:
            db_record (dict): Database record
            
        Returns:
            Transaction: New Transaction instance
        """
        return cls(db_record, source="db")
    
    def get_summary(self):
        """Get transaction summary for analytics."""
        return {
            "purchase_id": self.purchase_id,
            "timestamp": self.timestamp,
            "total_quantity": sum(item.get("quantity", 0) for item in self.items),
            "grand_total": self.receipt.get("total", 0)
        }