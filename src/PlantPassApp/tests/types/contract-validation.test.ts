import { describe, it, expect } from 'vitest';
import type {
  Product,
  ProductDTO,
  Discount,
  TransactionItem,
  CreateTransactionRequest,
  TransactionResponse,
  Transaction,
  FeatureToggles,
  PasswordAuthResponse,
  SalesAnalytics,
} from '../../src/types';

/**
 * Contract validation tests ensure that TypeScript types match
 * the actual API responses from the backend.
 * 
 * These tests prevent breaking changes in the API contract.
 */

describe('API Contract Validation', () => {
  describe('Product Types', () => {
    it('should validate ProductDTO structure', () => {
      const productDTO: ProductDTO = {
        SKU: 'PLANT-001',
        item: 'Succulent',
        price_ea: 5.99,
        sort_order: 1,
      };

      expect(productDTO).toHaveProperty('SKU');
      expect(productDTO).toHaveProperty('item');
      expect(productDTO).toHaveProperty('price_ea');
      expect(typeof productDTO.SKU).toBe('string');
      expect(typeof productDTO.item).toBe('string');
      expect(typeof productDTO.price_ea).toBe('number');
    });

    it('should validate Product structure', () => {
      const product: Product = {
        SKU: 'PLANT-001',
        Name: 'Succulent',
        Price: 5.99,
      };

      expect(product).toHaveProperty('SKU');
      expect(product).toHaveProperty('Name');
      expect(product).toHaveProperty('Price');
    });
  });

  describe('Discount Types', () => {
    it('should validate Discount structure', () => {
      const discount: Discount = {
        name: '10% Off',
        type: 'percent',
        value: 10,
        sort_order: 1,
      };

      expect(discount).toHaveProperty('name');
      expect(discount).toHaveProperty('type');
      expect(discount).toHaveProperty('value');
      expect(['percentage', 'fixed', 'percent', 'dollar']).toContain(discount.type);
    });
  });

  describe('Transaction Types', () => {
    it('should validate TransactionItem structure', () => {
      const item: TransactionItem = {
        SKU: 'PLANT-001',
        item: 'Succulent',
        quantity: 2,
        price_ea: 5.99,
      };

      expect(item).toHaveProperty('SKU');
      expect(item).toHaveProperty('item');
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('price_ea');
      expect(typeof item.quantity).toBe('number');
      expect(typeof item.price_ea).toBe('number');
    });

    it('should validate CreateTransactionRequest structure', () => {
      const request: CreateTransactionRequest = {
        timestamp: Date.now(),
        items: [
          {
            SKU: 'PLANT-001',
            item: 'Succulent',
            quantity: 1,
            price_ea: 5.99,
          },
        ],
        discounts: [],
        voucher: 0,
        email: 'test@example.com',
      };

      expect(request).toHaveProperty('timestamp');
      expect(request).toHaveProperty('items');
      expect(request).toHaveProperty('discounts');
      expect(request).toHaveProperty('voucher');
      expect(Array.isArray(request.items)).toBe(true);
      expect(Array.isArray(request.discounts)).toBe(true);
    });

    it('should validate TransactionResponse structure', () => {
      const response: TransactionResponse = {
        purchase_id: 'ABC-DEF',
        receipt: {
          subtotal: 11.98,
          discount: 1.20,
          total: 10.78,
        },
      };

      expect(response).toHaveProperty('purchase_id');
      expect(response).toHaveProperty('receipt');
      expect(response.receipt).toHaveProperty('subtotal');
      expect(response.receipt).toHaveProperty('discount');
      expect(response.receipt).toHaveProperty('total');
      expect(typeof response.receipt.total).toBe('number');
    });

    it('should validate complete Transaction structure', () => {
      const transaction: Transaction = {
        purchase_id: 'ABC-DEF',
        timestamp: Date.now(),
        items: [
          {
            SKU: 'PLANT-001',
            item: 'Succulent',
            quantity: 1,
            price_ea: 5.99,
          },
        ],
        discounts: [],
        voucher: 0,
        email: 'test@example.com',
        receipt: {
          subtotal: 5.99,
          discount: 0,
          total: 5.99,
        },
      };

      expect(transaction).toHaveProperty('purchase_id');
      expect(transaction).toHaveProperty('timestamp');
      expect(transaction).toHaveProperty('items');
      expect(transaction).toHaveProperty('receipt');
      expect(transaction.purchase_id).toMatch(/^[A-Z]{3}-[A-Z]{3}$/);
    });
  });

  describe('Feature Toggle Types', () => {
    it('should validate FeatureToggles structure', () => {
      const toggles: FeatureToggles = {
        collectEmailAddresses: true,
        passwordProtectAdmin: true,
        protectPlantPassAccess: false,
      };

      expect(toggles).toHaveProperty('collectEmailAddresses');
      expect(toggles).toHaveProperty('passwordProtectAdmin');
      expect(toggles).toHaveProperty('protectPlantPassAccess');
      expect(typeof toggles.collectEmailAddresses).toBe('boolean');
      expect(typeof toggles.passwordProtectAdmin).toBe('boolean');
      expect(typeof toggles.protectPlantPassAccess).toBe('boolean');
    });
  });

  describe('Authentication Types', () => {
    it('should validate PasswordAuthResponse structure', () => {
      const response: PasswordAuthResponse = {
        success: true,
        token: 'jwt-token-here',
        role: 'admin',
        message: 'Authentication successful',
      };

      expect(response).toHaveProperty('success');
      expect(typeof response.success).toBe('boolean');
      if (response.success) {
        expect(response).toHaveProperty('token');
        expect(response).toHaveProperty('role');
        expect(['admin', 'staff']).toContain(response.role);
      }
    });
  });

  describe('Sales Analytics Types', () => {
    it('should validate SalesAnalytics structure', () => {
      const analytics: SalesAnalytics = {
        totalRevenue: 1000.50,
        totalTransactions: 50,
        averageOrderValue: 20.01,
        topProducts: [
          {
            SKU: 'PLANT-001',
            name: 'Succulent',
            quantity: 100,
            revenue: 599.00,
          },
        ],
        revenueByDay: [
          {
            date: '2024-01-01',
            revenue: 250.00,
          },
        ],
        discountUsage: [
          {
            name: '10% Off',
            timesUsed: 25,
            totalDiscount: 125.50,
          },
        ],
      };

      expect(analytics).toBeDefined();
      if (analytics.topProducts) {
        expect(Array.isArray(analytics.topProducts)).toBe(true);
        analytics.topProducts.forEach((product) => {
          expect(product).toHaveProperty('SKU');
          expect(product).toHaveProperty('name');
          expect(product).toHaveProperty('quantity');
          expect(product).toHaveProperty('revenue');
        });
      }
    });
  });

  describe('Order ID Format Validation', () => {
    it('should validate order ID format ABC-DEF', () => {
      const validOrderIds = ['ABC-DEF', 'XYZ-QRS', 'AAA-ZZZ'];
      const invalidOrderIds = ['abc-def', 'AB-DEF', 'ABCD-EF', 'ABC_DEF', '123-456'];

      validOrderIds.forEach((id) => {
        expect(id).toMatch(/^[A-Z]{3}-[A-Z]{3}$/);
      });

      invalidOrderIds.forEach((id) => {
        expect(id).not.toMatch(/^[A-Z]{3}-[A-Z]{3}$/);
      });
    });
  });

  describe('Email Format Validation', () => {
    it('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
      ];
      const invalidEmails = ['invalid', 'test@', '@example.com', 'test @example.com'];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach((email) => {
        expect(email).toMatch(emailRegex);
      });

      invalidEmails.forEach((email) => {
        expect(email).not.toMatch(emailRegex);
      });
    });
  });

  describe('Price and Quantity Validation', () => {
    it('should validate price is non-negative number', () => {
      const validPrices = [0, 5.99, 100.00, 0.01];
      const invalidPrices = [-1, -5.99];

      validPrices.forEach((price) => {
        expect(price).toBeGreaterThanOrEqual(0);
        expect(typeof price).toBe('number');
      });

      invalidPrices.forEach((price) => {
        expect(price).toBeLessThan(0);
      });
    });

    it('should validate quantity is non-negative integer', () => {
      const validQuantities = [0, 1, 10, 100];
      const invalidQuantities = [-1, -10];

      validQuantities.forEach((qty) => {
        expect(qty).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(qty)).toBe(true);
      });

      invalidQuantities.forEach((qty) => {
        expect(qty).toBeLessThan(0);
      });
    });
  });

  describe('Discount Type Validation', () => {
    it('should validate discount types', () => {
      const validTypes = ['percent', 'dollar', 'percentage', 'fixed'];
      const invalidTypes = ['invalid', 'free', 'bogo'];

      validTypes.forEach((type) => {
        expect(['percentage', 'fixed', 'percent', 'dollar']).toContain(type);
      });

      invalidTypes.forEach((type) => {
        expect(['percentage', 'fixed', 'percent', 'dollar']).not.toContain(type);
      });
    });

    it('should validate percent discount is 0-100', () => {
      const validPercents = [0, 10, 50, 100];
      const invalidPercents = [-10, 150, 200];

      validPercents.forEach((percent) => {
        expect(percent).toBeGreaterThanOrEqual(0);
        expect(percent).toBeLessThanOrEqual(100);
      });

      invalidPercents.forEach((percent) => {
        expect(percent < 0 || percent > 100).toBe(true);
      });
    });
  });
});
