# TODO @maahum: Get all discounts from the database and return them as a list of discount objects.
#               
# Each discount object should have the following structure:
# {
#     "name": "string",
#     "percent_off": 0.0
# }
# 
# @returns A list of discount objects. Ex.
# [
#     {
#         "name": "Blooming Bundle",
#         "percent_off": 20.0
#     },
#     {
#         "name": "Hort Club Member",
#         "percent_off": 15.0
#     }
# ]
def get_all_discounts():
    """Return a list of all discounts."""
    pass  # Replace with DB read logic

# TODO @maahum: Implement the database create logic for this function.
#               This should take in a discount object with the same
#               structure as described in get_all_discounts, and save
#               it to the database. Be sure to handle cases where a 
#               discount with the same name already exists, and return
#               an appropriate error.
def create_discount(discount_data):
    """
    Create a new discount.
    discount_data must include at least:
    - name: str
    - percent_off: float
    """
    pass  # Replace with DB create logic

# TODO @maahum: Implement the database update logic for this function.
#               This should take in a name and an update_data object, and
#               update the corresponding discount in the database with the
#               fields provided in update_data. Be sure to handle cases where
#               the discount with the given name does not exist, and return
#               an appropriate error.
def update_discount(name, update_data):
    """Update an existing discount identified by name."""
    pass  # Replace with DB update logic

# TODO @maahum: Implement the database delete logic for this function.
#               This should take in a name and delete the corresponding discount
#               from the database. Be sure to handle cases where the discount
#               with the given name does not exist, and return an appropriate error.
def delete_discount(name):
    """Delete a discount by name."""
    pass  # Replace with DB delete logic
