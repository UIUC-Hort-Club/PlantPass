"""
Tests for Products Lambda Handler
"""
import pytest
import json
from unittest.mock import patch
from decimal import Decimal


class TestProductsHandler:
    """Test Products Lambda Handler"""
    
    @patch('database_interface.get_all_products')
    def test_get_all_products_success(
        self, mock_get_all, api_gateway_event, mock_context
    ):
        """Test successful retrieval of all products"""
        from ProductsHandler.lambda_handler import lambda_handler
        
        # Setup
        event = api_gateway_event.copy()
        event['routeKey'] = 'GET /products'
        
        mock_get_all.return_value = [
            {
                'SKU': 'PROD-001',
                'item': 'Product 1',
                'price_ea': Decimal('10.99'),
                'sort_order': 1,
            },
            {
                'SKU': 'PROD-002',
                'item': 'Product 2',
                'price_ea': Decimal('25.50'),
                'sort_order': 2,
            },
        ]
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert len(body) == 2
        assert body[0]['SKU'] == 'PROD-001'
        mock_get_all.assert_called_once()
    
    @patch('database_interface.replace_all_products')
    @patch('auth_middleware.verify_token')
    def test_replace_products_success(
        self, mock_verify, mock_replace, admin_auth_event, sample_product_data, mock_context
    ):
        """Test successful product replacement by admin"""
        from ProductsHandler.lambda_handler import lambda_handler
        
        # Setup
        event = admin_auth_event.copy()
        event['routeKey'] = 'PUT /products'
        event['body'] = json.dumps(sample_product_data)
        
        mock_verify.return_value = {'role': 'admin', 'user_id': 'admin-1'}
        mock_replace.return_value = {'updated': 2}
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert 'Products replaced successfully' in body['message']
        mock_replace.assert_called_once()
    
    @patch('auth_middleware.verify_token')
    def test_replace_products_requires_admin(
        self, mock_verify, staff_auth_event, sample_product_data, mock_context
    ):
        """Test that replacing products requires admin role"""
        from ProductsHandler.lambda_handler import lambda_handler
        
        # Setup
        event = staff_auth_event.copy()
        event['routeKey'] = 'PUT /products'
        event['body'] = json.dumps(sample_product_data)
        
        mock_verify.return_value = {'role': 'staff', 'user_id': 'staff-1'}
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 403
        body = json.loads(response['body'])
        assert 'Admin access required' in body['message']
    
    @patch('auth_middleware.verify_token')
    def test_replace_products_invalid_body(
        self, mock_verify, admin_auth_event, mock_context
    ):
        """Test replacing products with invalid body"""
        from ProductsHandler.lambda_handler import lambda_handler
        
        # Setup
        event = admin_auth_event.copy()
        event['routeKey'] = 'PUT /products'
        event['body'] = json.dumps({'not': 'an array'})
        
        mock_verify.return_value = {'role': 'admin', 'user_id': 'admin-1'}
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'must be a list' in body['message']
    
    def test_route_not_found(self, api_gateway_event, mock_context):
        """Test unknown route returns 404"""
        from ProductsHandler.lambda_handler import lambda_handler
        
        # Setup
        event = api_gateway_event.copy()
        event['routeKey'] = 'POST /products'
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 404
        body = json.loads(response['body'])
        assert 'not found' in body['message'].lower()
    
    @patch('database_interface.get_all_products')
    def test_exception_handling(
        self, mock_get_all, api_gateway_event, mock_context
    ):
        """Test exception handling returns 500"""
        from ProductsHandler.lambda_handler import lambda_handler
        
        # Setup
        event = api_gateway_event.copy()
        event['routeKey'] = 'GET /products'
        
        mock_get_all.side_effect = Exception('Database error')
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 500
        body = json.loads(response['body'])
        assert 'message' in body
