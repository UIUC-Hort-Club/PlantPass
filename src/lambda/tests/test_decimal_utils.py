"""
Tests for decimal utilities
"""
import pytest
from decimal import Decimal
import sys
import os

# Add shared directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../shared'))

from decimal_utils import (
    decimal_to_float,
    float_to_decimal,
    safe_decimal_add,
    safe_decimal_multiply,
    format_currency,
)


class TestDecimalToFloat:
    """Test decimal to float conversion"""
    
    def test_converts_decimal_to_float(self):
        """Test basic decimal to float conversion"""
        result = decimal_to_float(Decimal('10.99'))
        assert result == 10.99
        assert isinstance(result, float)
    
    def test_handles_zero(self):
        """Test conversion of zero"""
        result = decimal_to_float(Decimal('0'))
        assert result == 0.0
    
    def test_handles_negative(self):
        """Test conversion of negative numbers"""
        result = decimal_to_float(Decimal('-5.50'))
        assert result == -5.50
    
    def test_handles_large_numbers(self):
        """Test conversion of large numbers"""
        result = decimal_to_float(Decimal('999999.99'))
        assert result == 999999.99


class TestFloatToDecimal:
    """Test float to decimal conversion"""
    
    def test_converts_float_to_decimal(self):
        """Test basic float to decimal conversion"""
        result = float_to_decimal(10.99)
        assert result == Decimal('10.99')
        assert isinstance(result, Decimal)
    
    def test_handles_integer(self):
        """Test conversion of integer"""
        result = float_to_decimal(10)
        assert result == Decimal('10.00')
    
    def test_rounds_to_two_decimals(self):
        """Test rounding to 2 decimal places"""
        result = float_to_decimal(10.999)
        assert result == Decimal('11.00')
    
    def test_handles_string_input(self):
        """Test conversion from string"""
        result = float_to_decimal('10.99')
        assert result == Decimal('10.99')


class TestSafeDecimalAdd:
    """Test safe decimal addition"""
    
    def test_adds_two_decimals(self):
        """Test adding two decimal numbers"""
        result = safe_decimal_add(Decimal('10.50'), Decimal('5.25'))
        assert result == Decimal('15.75')
    
    def test_adds_multiple_decimals(self):
        """Test adding multiple decimal numbers"""
        result = safe_decimal_add(
            Decimal('10.00'),
            Decimal('5.50'),
            Decimal('2.25')
        )
        assert result == Decimal('17.75')
    
    def test_handles_zero(self):
        """Test adding zero"""
        result = safe_decimal_add(Decimal('10.00'), Decimal('0'))
        assert result == Decimal('10.00')
    
    def test_handles_negative(self):
        """Test adding negative numbers"""
        result = safe_decimal_add(Decimal('10.00'), Decimal('-5.00'))
        assert result == Decimal('5.00')
    
    def test_handles_empty_args(self):
        """Test with no arguments"""
        result = safe_decimal_add()
        assert result == Decimal('0.00')


class TestSafeDecimalMultiply:
    """Test safe decimal multiplication"""
    
    def test_multiplies_two_decimals(self):
        """Test multiplying two decimal numbers"""
        result = safe_decimal_multiply(Decimal('10.00'), Decimal('2'))
        assert result == Decimal('20.00')
    
    def test_multiplies_price_by_quantity(self):
        """Test typical price * quantity calculation"""
        result = safe_decimal_multiply(Decimal('5.99'), Decimal('3'))
        assert result == Decimal('17.97')
    
    def test_handles_zero(self):
        """Test multiplying by zero"""
        result = safe_decimal_multiply(Decimal('10.00'), Decimal('0'))
        assert result == Decimal('0.00')
    
    def test_handles_fractional_multiplier(self):
        """Test multiplying by fraction (discount)"""
        result = safe_decimal_multiply(Decimal('100.00'), Decimal('0.10'))
        assert result == Decimal('10.00')
    
    def test_rounds_to_two_decimals(self):
        """Test rounding result to 2 decimal places"""
        result = safe_decimal_multiply(Decimal('10.00'), Decimal('0.333'))
        assert result == Decimal('3.33')


class TestFormatCurrency:
    """Test currency formatting"""
    
    def test_formats_decimal_as_currency(self):
        """Test formatting decimal as currency string"""
        result = format_currency(Decimal('10.99'))
        assert result == '$10.99'
    
    def test_formats_whole_number(self):
        """Test formatting whole number"""
        result = format_currency(Decimal('10.00'))
        assert result == '$10.00'
    
    def test_formats_large_number(self):
        """Test formatting large number with commas"""
        result = format_currency(Decimal('1234.56'))
        assert result == '$1,234.56'
    
    def test_formats_zero(self):
        """Test formatting zero"""
        result = format_currency(Decimal('0.00'))
        assert result == '$0.00'
    
    def test_handles_negative(self):
        """Test formatting negative number"""
        result = format_currency(Decimal('-10.99'))
        assert result == '-$10.99'
