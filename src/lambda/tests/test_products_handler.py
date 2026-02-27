"""
Tests for ProductsHandler Lambda
"""
import pytest
import json
from unittest.mock import patch, MagicMock
import sys
import os

# Add handler to path before importing
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../ProductsHandler'))


@pytest.fixture
def products_handler():
    """Import and return the products handler with mocked dependencies"""
    # Mock boto3 and botocore before importing
    sys.modules['boto3'] = MagicMock()
    sys.modules['botocore'] = MagicMock()
    sys.modules['botocore.exceptions'] = MagicMock()
    
    from lambda_handler import lambda_handler
    return lambda_handler


@pytest.fixture
def mock_database():
    """Mock database operations"""
    with patch('lambda_handler.get_all_products') as get_all, \
         patch('lambda_handler.replace_all_products') as replace:
        yield {'get_all': get_all, 'replace': replace}


@pytest.fixture
def mock_auth():
    """Mock authentication"""
    with patch('lambda_handler.extract_token') as extract, \
         patch('lambda_handler.verify_token') as verify:
        verify.return_value = {'role': 'admin', 'user_id': 'test-admin'}
        yield {'extract': extract, 'verify': verify}


class TestGetProducts:
    def test_get_all_products_success(self, products_handler, mock_database, api_gateway_event, sample_product_data):
        """Test successful retrieval of all products"""
        mock_database['get_all'].return_value = sample_product_data
        
        event = api_gateway_event.copy()
        event['routeKey'] = 'GET /products'
        
        response = products_handler(event, {})
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert len(body) == 2
        assert body[0]['SKU'] == 'PROD-001'
        mock_database['get_all'].assert_called_once()
    
    def test_get_all_products_empty(self, products_handler, mock_database, api_gateway_event):
        """Test getting products when none exist"""
        mock_database['get_all'].return_value = []
        
        event = api_gateway_event.copy()
        event['routeKey'] = 'GET /products'
        
        response = products_handler(event, {})
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body == []


class TestReplaceProducts:
    def test_replace_products_success(self, products_handler, mock_database, mock_auth, api_gateway_event, sample_product_data):
        """Test successful product replacement"""
        mock_database['replace'].return_value = {'replaced': 2}
        
        event = api_gateway_event.copy()
        event['routeKey'] = 'PUT /products'
        event['headers']['Authorization'] = 'Bearer token'
        event['body'] = json.dumps(sample_product_data)
        
        response = products_handler(event, {})
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert 'Products replaced successfully' in body['message']
        mock_database['replace'].assert_called_once_with(sample_product_data)
    
    def test_replace_products_requires_admin(self, products_handler, mock_auth, api_gateway_event):
        """Test that replace products requires admin role"""
        mock_auth['verify'].return_value = {'role': 'staff', 'user_id': 'test'}
        
        event = api_gateway_event.copy()
        event['routeKey'] = 'PUT /products'
        event['headers']['Authorization'] = 'Bearer token'
        event['body'] = json.dumps([])
        
        response = products_handler(event, {})
        
        assert response['statusCode'] == 403
        body = json.loads(response['body'])
        assert 'Admin access required' in body['message']
    
    def test_replace_products_invalid_body(self, products_handler, mock_auth, api_gateway_event):
        """Test replace products with non-list body"""
        event = api_gateway_event.copy()
        event['routeKey'] = 'PUT /products'
        event['headers']['Authorization'] = 'Bearer token'
        event['body'] = json.dumps({'not': 'a list'})
        
        response = products_handler(event, {})
        
        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'must be a list' in body['message']


class TestErrorHandling:
    def test_route_not_found(self, products_handler, api_gateway_event):
        """Test handling of unknown routes"""
        with patch('lambda_handler.extract_token') as mock_extract, \
             patch('lambda_handler.verify_token') as mock_verify:
            mock_verify.return_value = {'role': 'admin', 'user_id': 'test'}
            
            event = api_gateway_event.copy()
            event['routeKey'] = 'DELETE /products'
            event['headers']['Authorization'] = 'Bearer token'
            
            response = products_handler(event, {})
            
            assert response['statusCode'] == 404
    
    def test_database_error(self, products_handler, mock_database, api_gateway_event):
        """Test handling of database errors"""
        mock_database['get_all'].side_effect = Exception('Database connection failed')
        
        event = api_gateway_event.copy()
        event['routeKey'] = 'GET /products'
        
        response = products_handler(event, {})
        
        assert response['statusCode'] == 500
        body = json.loads(response['body'])
        assert 'message' in body
