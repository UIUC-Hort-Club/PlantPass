"""
Tests for Transaction Lambda Handler
"""
import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from decimal import Decimal


@pytest.fixture
def mock_dynamodb():
    """Mock DynamoDB client"""
    with patch('dynamodb_client.get_dynamodb_client') as mock:
        yield mock.return_value


@pytest.fixture
def mock_websocket():
    """Mock WebSocket notifier"""
    with patch('websocket_notifier.notify_transaction_update') as mock:
        yield mock


class TestTransactionHandler:
    """Test Transaction Lambda Handler"""
    
    @patch('database_interface.create_transaction')
    def test_create_transaction_success(
        self, mock_create, api_gateway_event, sample_transaction_data, mock_context
    ):
        """Test successful transaction creation"""
        from lambda_handler import lambda_handler
        
        # Setup
        event = api_gateway_event.copy()
        event['routeKey'] = 'POST /transactions'
        event['body'] = json.dumps(sample_transaction_data)
        
        mock_create.return_value = {
            'purchase_id': 'ABC-DEF',
            'receipt': {
                'subtotal': Decimal('27.48'),
                'discount': Decimal('7.75'),
                'total': Decimal('19.73'),
            },
        }
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 201
        body = json.loads(response['body'])
        assert body['message'] == 'Transaction created successfully'
        assert 'transaction' in body
        assert body['transaction']['purchase_id'] == 'ABC-DEF'
        mock_create.assert_called_once()
    
    @patch('database_interface.create_transaction')
    def test_create_transaction_validation_error(
        self, mock_create, api_gateway_event, mock_context
    ):
        """Test transaction creation with invalid data"""
        from lambda_handler import lambda_handler
        
        # Setup - empty items array
        event = api_gateway_event.copy()
        event['routeKey'] = 'POST /transactions'
        event['body'] = json.dumps({
            'timestamp': 1640000000000,
            'items': [],
            'discounts': [],
            'voucher': 0,
        })
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'Invalid transaction data' in body['message']
        assert 'errors' in body
        mock_create.assert_not_called()
    
    @patch('database_interface.read_transaction')
    def test_get_transaction_success(
        self, mock_read, api_gateway_event, mock_context
    ):
        """Test successful transaction retrieval"""
        from lambda_handler import lambda_handler
        
        # Setup
        event = api_gateway_event.copy()
        event['routeKey'] = 'GET /transactions/{purchase_id}'
        event['pathParameters'] = {'purchase_id': 'ABC-DEF'}
        
        mock_read.return_value = {
            'purchase_id': 'ABC-DEF',
            'timestamp': 1640000000000,
            'items': [],
            'receipt': {'total': Decimal('10.00')},
        }
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['purchase_id'] == 'ABC-DEF'
        mock_read.assert_called_once_with('ABC-DEF')
    
    @patch('database_interface.read_transaction')
    def test_get_transaction_not_found(
        self, mock_read, api_gateway_event, mock_context
    ):
        """Test transaction not found"""
        from lambda_handler import lambda_handler
        
        # Setup
        event = api_gateway_event.copy()
        event['routeKey'] = 'GET /transactions/{purchase_id}'
        event['pathParameters'] = {'purchase_id': 'XYZ-ABC'}
        
        mock_read.return_value = None
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 404
        body = json.loads(response['body'])
        assert 'not found' in body['message'].lower()
    
    def test_get_transaction_invalid_order_id(
        self, api_gateway_event, mock_context
    ):
        """Test transaction retrieval with invalid order ID format"""
        from lambda_handler import lambda_handler
        
        # Setup
        event = api_gateway_event.copy()
        event['routeKey'] = 'GET /transactions/{purchase_id}'
        event['pathParameters'] = {'purchase_id': 'invalid-id'}
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'Invalid order ID format' in body['message']
    
    @patch('database_interface.update_transaction')
    def test_update_transaction_success(
        self, mock_update, api_gateway_event, mock_context
    ):
        """Test successful transaction update"""
        from lambda_handler import lambda_handler
        
        # Setup
        event = api_gateway_event.copy()
        event['routeKey'] = 'PUT /transactions/{purchase_id}'
        event['pathParameters'] = {'purchase_id': 'ABC-DEF'}
        event['body'] = json.dumps({
            'payment': {
                'method': 'Cash',
                'paid': True,
            }
        })
        
        mock_update.return_value = {
            'purchase_id': 'ABC-DEF',
            'payment': {'method': 'Cash', 'paid': True},
        }
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert 'transaction' in body
        mock_update.assert_called_once()
    
    @patch('database_interface.delete_transaction')
    def test_delete_transaction_success(
        self, mock_delete, api_gateway_event, mock_context
    ):
        """Test successful transaction deletion"""
        from lambda_handler import lambda_handler
        
        # Setup
        event = api_gateway_event.copy()
        event['routeKey'] = 'DELETE /transactions/{purchase_id}'
        event['pathParameters'] = {'purchase_id': 'ABC-DEF'}
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 204
        mock_delete.assert_called_once_with('ABC-DEF')
    
    @patch('database_interface.get_recent_unpaid_transactions')
    def test_get_recent_unpaid_transactions(
        self, mock_get_recent, api_gateway_event, mock_context
    ):
        """Test getting recent unpaid transactions"""
        from lambda_handler import lambda_handler
        
        # Setup
        event = api_gateway_event.copy()
        event['routeKey'] = 'GET /transactions/recent-unpaid'
        event['queryStringParameters'] = {'limit': '10'}
        
        mock_get_recent.return_value = [
            {'purchase_id': 'ABC-DEF', 'total': Decimal('10.00')},
            {'purchase_id': 'XYZ-QRS', 'total': Decimal('20.00')},
        ]
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert 'transactions' in body
        assert len(body['transactions']) == 2
        mock_get_recent.assert_called_once_with(10)
    
    @patch('sales_analytics.compute_sales_analytics')
    def test_get_sales_analytics(
        self, mock_analytics, api_gateway_event, mock_context
    ):
        """Test sales analytics endpoint"""
        from lambda_handler import lambda_handler
        
        # Setup
        event = api_gateway_event.copy()
        event['routeKey'] = 'GET /transactions/sales-analytics'
        
        mock_analytics.return_value = {
            'total_sales': Decimal('1000.00'),
            'total_orders': 50,
            'average_order_value': Decimal('20.00'),
        }
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert 'total_sales' in body
        mock_analytics.assert_called_once()
    
    @patch('sales_analytics.clear_all_transactions')
    @patch('auth_middleware.verify_token')
    def test_clear_all_transactions_admin_only(
        self, mock_verify, mock_clear, admin_auth_event, mock_context
    ):
        """Test clearing all transactions requires admin role"""
        from lambda_handler import lambda_handler
        
        # Setup
        event = admin_auth_event.copy()
        event['routeKey'] = 'DELETE /transactions/clear-all'
        
        mock_verify.return_value = {'role': 'admin', 'user_id': 'admin-1'}
        mock_clear.return_value = 25
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['cleared_count'] == 25
        mock_clear.assert_called_once()
    
    def test_route_not_found(self, api_gateway_event, mock_context):
        """Test unknown route returns 404"""
        from lambda_handler import lambda_handler
        
        # Setup
        event = api_gateway_event.copy()
        event['routeKey'] = 'GET /unknown-route'
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 404
        body = json.loads(response['body'])
        assert 'not found' in body['message'].lower()
    
    def test_exception_handling(self, api_gateway_event, mock_context):
        """Test exception handling returns 500"""
        from lambda_handler import lambda_handler
        
        # Setup - malformed JSON
        event = api_gateway_event.copy()
        event['routeKey'] = 'POST /transactions'
        event['body'] = 'invalid json'
        
        # Execute
        response = lambda_handler(event, mock_context)
        
        # Assert
        assert response['statusCode'] == 500
        body = json.loads(response['body'])
        assert 'message' in body
