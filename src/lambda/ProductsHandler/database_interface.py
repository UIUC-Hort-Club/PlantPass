# TODO @maahum: Get all products from the database and return them as a list of product objects.
#               
# Each product object should have the following structure:
# {
#     "SKU": "string",
#     "item": "string",
#     "price_ea": 0.0
# }
# 
# @returns A list of product objects. Ex.
# [
#     {
#         "SKU": "SKU123",
#         "item": "Plant A",
#         "price_ea": 10.00
#     },
#     {
#         "SKU": "SKU456",
#         "item": "Plant B",
#         "price_ea": 15.00
#     }
# ]
def get_all_products():
    """Return a list of all products."""
    pass  # Replace with DB read logic

# TODO @maahum: Implement the database create logic for this function.
#               This should take in a product object with the same
#               structure as described in get_all_products, and save
#               it to the database. Be sure to handle cases where a 
#               product with the same SKU already exists, and return
#               an appropriate error.
def create_product(product_data):
    """
    Create a new product.
    product_data must include at least:
    - SKU: str
    - item: str
    - price_ea: float
    """
    pass  # Replace with DB create logic

# TODO @maahum: Implement the database update logic for this function.
#               This should take in a SKU and an update_data object, and
#               update the corresponding product in the database with the
#               fields provided in update_data. Be sure to handle cases where
#               the product with the given SKU does not exist, and return
#               an appropriate error.
def update_product(SKU, update_data):
    """Update an existing product identified by SKU."""
    pass  # Replace with DB update logic

# TODO @maahum: Implement the database delete logic for this function.
#               This should take in a SKU and delete the corresponding product
#               from the database. Be sure to handle cases where the product
#               with the given SKU does not exist, and return an appropriate error.
def delete_product(SKU):
    """Delete a product by SKU."""
    pass  # Replace with DB delete logic