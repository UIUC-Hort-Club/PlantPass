"""
Integration tests for complete transaction flow
Tests the full lifecycle: create -> read -> update -> delete
"""
import pytest
import json
from unittest.mock import patch, MagicMock
from decimal import Decimal


@pytest.mark.integration
class TestTransactionFlowIntegration:
    """Integration tests for transaction lifecycle"""
    
    @patch('dynamodb_client.get_dynamodb_client')
    @patch('websocket_notifier.notify_transaction_update')
    def test_complete_transaction_lifecycle(
        self, mock_websocket, mock_dynamodb, api_gateway_event, mock_context
    ):
        """Test complete transaction flow from creation to deletion"""
        from TransactionHandler.lambda_handler import lambda_handler
        
        # Mock DynamoDB table
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        
        # 1. CREATE TRANSACTION
        create_event = api_gateway_event.copy()
        create_event['routeKey'] = 'POST /transactions'
        create_event['body'] = json.dumps({
            'timestamp': 1640000000000,
            'items': [
                {
                    'SKU': 'PLANT-001',
                    'item': 'Succulent',
                    'quantity': 2,
                    'price_ea': 5.99,
                }
            ],
            'discounts': [
                {
                    'name': '10% Off',
                    'type': 'percent',
                    'value': 10,
                    'selected': True,
                }
            ],
            'voucher': 2.00,
            'email': 'test@example.com',
        })
        
        # Mock DynamoDB put_item for create
        mock_table.put_item.return_value = {}
        
        with patch('database_interface.generate_order_id', return_value='ABC-DEF'):
            create_response = lambda_handler(create_event, mock_context)
        
        assert create_response['statusCode'] == 201
        create_body = json.loads(create_response['body'])
        assert 'transaction' in create_body
        purchase_id = create_body['transaction']['purchase_id']
        assert purchase_id == 'ABC-DEF'
        
        # Verify WebSocket notification was sent
        mock_websocket.assert_called_once()
        
        # 2. READ TRANSACTION
        read_event = api_gateway_event.copy()
        read_event['routeKey'] = 'GET /transactions/{purchase_id}'
        read_event['pathParameters'] = {'purchase_id': purchase_id}
        
        # Mock DynamoDB get_item for read
        mock_table.get_item.return_value = {
            'Item': {
                'purchase_id': purchase_id,
                'timestamp': 1640000000000,
                'items': [
                    {
                        'SKU': 'PLANT-001',
                        'item': 'Succulent',
                        'quantity': Decimal('2'),
                        'price_ea': Decimal('5.99'),
                    }
                ],
                'receipt': {
                    'subtotal': Decimal('11.98'),
                    'discount': Decimal('3.20'),
                    'total': Decimal('8.78'),
                },
            }
        }
        
        read_response = lambda_handler(read_event, mock_context)
        
        assert read_response['statusCode'] == 200
        read_body = json.loads(read_response['body'])
        assert read_body['purchase_id'] == purchase_id
        
        # 3. UPDATE TRANSACTION (mark as paid)
        update_event = api_gateway_event.copy()
        update_event['routeKey'] = 'PUT /transactions/{purchase_id}'
        update_event['pathParameters'] = {'purchase_id': purchase_id}
        update_event['body'] = json.dumps({
            'payment': {
                'method': 'Cash',
                'paid': True,
            }
        })
        
        # Mock DynamoDB update_item for update
        mock_table.update_item.return_value = {
            'Attributes': {
                'purchase_id': purchase_id,
                'payment': {
                    'method': 'Cash',
                    'paid': True,
                },
            }
        }
        
        update_response = lambda_handler(update_event, mock_context)
        
        assert update_response['statusCode'] == 200
        update_body = json.loads(update_response['body'])
        assert 'transaction' in update_body
        
        # 4. DELETE TRANSACTION
        delete_event = api_gateway_event.copy()
        delete_event['routeKey'] = 'DELETE /transactions/{purchase_id}'
        delete_event['pathParameters'] = {'purchase_id': purchase_id}
        
        # Mock DynamoDB delete_item for delete
        mock_table.delete_item.return_value = {}
        
        delete_response = lambda_handler(delete_event, mock_context)
        
        assert delete_response['statusCode'] == 204
        
        # Verify all DynamoDB operations were called
        assert mock_table.put_item.called
        assert mock_table.get_item.called
        assert mock_table.update_item.called
        assert mock_table.delete_item.called
    
    @patch('dynamodb_client.get_dynamodb_client')
    def test_transaction_validation_prevents_invalid_data(
        self, mock_dynamodb, api_gateway_event, mock_context
    ):
        """Test that validation prevents invalid transactions from being created"""
        from TransactionHandler.lambda_handler import lambda_handler
        
        # Attempt to create transaction with invalid data
        invalid_event = api_gateway_event.copy()
        invalid_event['routeKey'] = 'POST /transactions'
        invalid_event['body'] = json.dumps({
            'timestamp': 1640000000000,
            'items': [],  # Empty items - invalid
            'discounts': [],
            'voucher': 0,
        })
        
        response = lambda_handler(invalid_event, mock_context)
        
        # Should return 400 validation error
        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'Invalid transaction data' in body['message']
        assert 'errors' in body
        
        # Verify DynamoDB was never called
        mock_dynamodb.return_value.Table.return_value.put_item.assert_not_called()
    
    @patch('dynamodb_client.get_dynamodb_client')
    def test_transaction_not_found_returns_404(
        self, mock_dynamodb, api_gateway_event, mock_context
    ):
        """Test that reading non-existent transaction returns 404"""
        from TransactionHandler.lambda_handler import lambda_handler
        
        # Mock DynamoDB returning no item
        mock_table = MagicMock()
        mock_dynamodb.return_value.Table.return_value = mock_table
        mock_table.get_item.return_value = {}
        
        read_event = api_gateway_event.copy()
        read_event['routeKey'] = 'GET /transactions/{purchase_id}'
        read_event['pathParameters'] = {'purchase_id': 'XYZ-ABC'}
        
        response = lambda_handler(read_event, mock_context)
        
        assert response['statusCode'] == 404
        body = json.loads(response['body'])
        assert 'not found' in body['message'].lower()
