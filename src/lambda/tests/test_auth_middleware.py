"""
Tests for authentication middleware
"""
import pytest
from unittest.mock import patch, MagicMock
import sys
import os

# Add shared directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../shared'))

from auth_middleware import (
    extract_token,
    verify_token,
    require_auth,
    is_public_endpoint,
    AuthError,
)


class TestExtractToken:
    """Test token extraction from event"""
    
    def test_extracts_token_from_authorization_header(self):
        """Test extracting Bearer token from Authorization header"""
        event = {
            'headers': {
                'Authorization': 'Bearer test-token-123',
            }
        }
        token = extract_token(event)
        assert token == 'test-token-123'
    
    def test_extracts_token_lowercase_header(self):
        """Test case-insensitive header extraction"""
        event = {
            'headers': {
                'authorization': 'Bearer test-token-123',
            }
        }
        token = extract_token(event)
        assert token == 'test-token-123'
    
    def test_raises_error_when_no_authorization_header(self):
        """Test error when Authorization header is missing"""
        event = {'headers': {}}
        with pytest.raises(AuthError) as exc_info:
            extract_token(event)
        assert exc_info.value.status_code == 401
        assert 'Authorization header required' in exc_info.value.message
    
    def test_raises_error_when_not_bearer_token(self):
        """Test error when token is not Bearer type"""
        event = {
            'headers': {
                'Authorization': 'Basic dXNlcjpwYXNz',
            }
        }
        with pytest.raises(AuthError) as exc_info:
            extract_token(event)
        assert exc_info.value.status_code == 401
        assert 'Bearer token required' in exc_info.value.message
    
    def test_raises_error_when_token_missing(self):
        """Test error when Bearer keyword present but token missing"""
        event = {
            'headers': {
                'Authorization': 'Bearer',
            }
        }
        with pytest.raises(AuthError) as exc_info:
            extract_token(event)
        assert exc_info.value.status_code == 401


class TestVerifyToken:
    """Test JWT token verification"""
    
    @patch('auth_middleware.jwt.decode')
    def test_verifies_valid_token(self, mock_decode):
        """Test successful token verification"""
        mock_decode.return_value = {
            'user_id': 'user-123',
            'role': 'admin',
            'exp': 9999999999,
        }
        
        decoded = verify_token('valid-token')
        
        assert decoded['user_id'] == 'user-123'
        assert decoded['role'] == 'admin'
        mock_decode.assert_called_once()
    
    @patch('auth_middleware.jwt.decode')
    def test_raises_error_on_expired_token(self, mock_decode):
        """Test error when token is expired"""
        from jwt import ExpiredSignatureError
        mock_decode.side_effect = ExpiredSignatureError('Token expired')
        
        with pytest.raises(AuthError) as exc_info:
            verify_token('expired-token')
        assert exc_info.value.status_code == 401
        assert 'expired' in exc_info.value.message.lower()
    
    @patch('auth_middleware.jwt.decode')
    def test_raises_error_on_invalid_token(self, mock_decode):
        """Test error when token is invalid"""
        from jwt import InvalidTokenError
        mock_decode.side_effect = InvalidTokenError('Invalid token')
        
        with pytest.raises(AuthError) as exc_info:
            verify_token('invalid-token')
        assert exc_info.value.status_code == 401
        assert 'invalid' in exc_info.value.message.lower()
    
    @patch('auth_middleware.jwt.decode')
    def test_raises_error_on_malformed_token(self, mock_decode):
        """Test error when token is malformed"""
        from jwt import DecodeError
        mock_decode.side_effect = DecodeError('Malformed token')
        
        with pytest.raises(AuthError) as exc_info:
            verify_token('malformed-token')
        assert exc_info.value.status_code == 401


class TestIsPublicEndpoint:
    """Test public endpoint detection"""
    
    def test_identifies_public_endpoints(self):
        """Test that public endpoints are correctly identified"""
        public_routes = [
            'GET /products',
            'GET /discounts',
            'GET /payment-methods',
            'OPTIONS /transactions',
        ]
        
        for route in public_routes:
            assert is_public_endpoint(route) is True
    
    def test_identifies_protected_endpoints(self):
        """Test that protected endpoints are correctly identified"""
        protected_routes = [
            'PUT /products',
            'POST /transactions',
            'DELETE /transactions/{id}',
            'GET /transactions/sales-analytics',
        ]
        
        for route in protected_routes:
            assert is_public_endpoint(route) is False
    
    def test_handles_unknown_routes(self):
        """Test handling of unknown routes (default to protected)"""
        assert is_public_endpoint('GET /unknown') is False
        assert is_public_endpoint('') is False


class TestRequireAuth:
    """Test require_auth decorator"""
    
    @patch('auth_middleware.extract_token')
    @patch('auth_middleware.verify_token')
    def test_allows_authenticated_request(self, mock_verify, mock_extract):
        """Test that authenticated requests are allowed"""
        mock_extract.return_value = 'valid-token'
        mock_verify.return_value = {'user_id': 'user-123', 'role': 'admin'}
        
        @require_auth
        def handler(event, context):
            return {'statusCode': 200, 'body': 'Success'}
        
        event = {'headers': {'Authorization': 'Bearer valid-token'}}
        response = handler(event, None)
        
        assert response['statusCode'] == 200
        assert 'auth' in event
        assert event['auth']['user_id'] == 'user-123'
    
    @patch('auth_middleware.extract_token')
    def test_blocks_unauthenticated_request(self, mock_extract):
        """Test that unauthenticated requests are blocked"""
        mock_extract.side_effect = AuthError('No token', 401)
        
        @require_auth
        def handler(event, context):
            return {'statusCode': 200, 'body': 'Success'}
        
        event = {'headers': {}}
        response = handler(event, None)
        
        assert response['statusCode'] == 401
    
    @patch('auth_middleware.extract_token')
    @patch('auth_middleware.verify_token')
    def test_enforces_role_based_access(self, mock_verify, mock_extract):
        """Test role-based access control"""
        mock_extract.return_value = 'valid-token'
        mock_verify.return_value = {'user_id': 'user-123', 'role': 'staff'}
        
        @require_auth(required_role='admin')
        def handler(event, context):
            return {'statusCode': 200, 'body': 'Success'}
        
        event = {'headers': {'Authorization': 'Bearer valid-token'}}
        response = handler(event, None)
        
        assert response['statusCode'] == 403


class TestAuthError:
    """Test AuthError exception"""
    
    def test_creates_auth_error_with_message(self):
        """Test AuthError creation"""
        error = AuthError('Test error', 401)
        assert error.message == 'Test error'
        assert error.status_code == 401
    
    def test_auth_error_is_exception(self):
        """Test that AuthError is an Exception"""
        error = AuthError('Test', 401)
        assert isinstance(error, Exception)
    
    def test_auth_error_can_be_raised(self):
        """Test that AuthError can be raised and caught"""
        with pytest.raises(AuthError) as exc_info:
            raise AuthError('Test error', 403)
        assert exc_info.value.status_code == 403
