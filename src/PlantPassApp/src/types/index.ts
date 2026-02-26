// ============================================================================
// Core Domain Types
// ============================================================================

/**
 * Product as stored in the database
 */
export interface ProductDTO {
  SKU: string;
  item: string;
  price_ea: number;
}

/**
 * Product as used in the frontend
 */
export interface Product {
  SKU: string;
  Name: string;
  Price: number;
}

/**
 * Discount types supported by the system
 */
export type DiscountType = 'percentage' | 'fixed';

/**
 * Discount configuration
 */
export interface Discount {
  name: string;
  type: DiscountType;
  value: number;
}

/**
 * Discount with selection state (used in orders)
 */
export interface DiscountWithSelection extends Discount {
  selected: boolean;
}

/**
 * Payment method configuration
 */
export interface PaymentMethod {
  name: string;
  enabled: boolean;
}

/**
 * Transaction item (line item in an order)
 */
export interface TransactionItem {
  SKU: string;
  item: string;
  quantity: number;
  price_ea: number;
}

/**
 * Receipt totals
 */
export interface ReceiptTotals {
  subtotal: number;
  discount: number;
  grandTotal: number;
}

/**
 * Transaction data for creating a new transaction
 */
export interface CreateTransactionRequest {
  timestamp: number;
  items: TransactionItem[];
  discounts: DiscountWithSelection[];
  voucher: number;
  email?: string;
}

/**
 * Transaction data for updating an existing transaction
 */
export interface UpdateTransactionRequest {
  items: TransactionItem[];
  discounts: DiscountWithSelection[];
  voucher: number;
}

/**
 * Transaction response from the API
 */
export interface TransactionResponse {
  purchase_id: string;
  receipt: {
    subtotal: number;
    discount: number;
    total: number;
  };
  discounts?: DiscountWithSelection[];
  club_voucher?: number;
}

/**
 * Complete transaction record
 */
export interface Transaction {
  purchase_id: string;
  timestamp: number;
  items: TransactionItem[];
  discounts: DiscountWithSelection[];
  voucher: number;
  email?: string;
  receipt: {
    subtotal: number;
    discount: number;
    total: number;
  };
}

// ============================================================================
// Feature Toggles
// ============================================================================

/**
 * Feature toggle configuration
 */
export interface FeatureToggles {
  collectEmailAddresses: boolean;
  passwordProtectAdmin: boolean;
  protectPlantPassAccess: boolean;
}

// ============================================================================
// Authentication & Authorization
// ============================================================================

/**
 * Authentication token types
 */
export type TokenType = 'admin_token' | 'staff_token';

/**
 * Lock state for PlantPass access
 */
export interface LockState {
  locked: boolean;
}

/**
 * Password authentication request
 */
export interface PasswordAuthRequest {
  password: string;
}

/**
 * Password authentication response
 */
export interface PasswordAuthResponse {
  success: boolean;
  token?: string;
  role?: 'admin' | 'staff';
  message?: string;
}

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ============================================================================
// Sales Analytics
// ============================================================================

/**
 * Sales analytics data
 */
export interface SalesAnalytics {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  topProducts: Array<{
    SKU: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
  }>;
  discountUsage: Array<{
    name: string;
    timesUsed: number;
    totalDiscount: number;
  }>;
}

// ============================================================================
// API Response Wrappers
// ============================================================================

/**
 * Standard API error response
 */
export interface ApiError {
  error?: string;
  message?: string;
  errors?: string[];
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API request options
 */
export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  timeout?: number;
  body?: unknown;
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Notification severity levels
 */
export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification object
 */
export interface Notification {
  id: number;
  severity: NotificationSeverity;
  message: string;
  duration: number;
}

/**
 * Product quantities state (SKU -> quantity string)
 */
export type ProductQuantities = Record<string, string>;

/**
 * Product subtotals state (SKU -> subtotal string)
 */
export type ProductSubtotals = Record<string, string>;

/**
 * Receipt data for display
 */
export interface ReceiptData {
  totals: ReceiptTotals;
  discounts: DiscountWithSelection[];
  voucher: number;
}

// ============================================================================
// WebSocket Types
// ============================================================================

/**
 * WebSocket message types
 */
export type WebSocketMessageType = 
  | 'products_updated'
  | 'discounts_updated'
  | 'transaction_created'
  | 'transaction_updated'
  | 'lock_state_changed';

/**
 * WebSocket message
 */
export interface WebSocketMessage {
  type: WebSocketMessageType;
  data?: unknown;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract keys of T where value is of type V
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
