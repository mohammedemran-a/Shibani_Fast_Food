// API Client
export { default as apiClient } from './apiClient';

// Endpoints
export * from './endpoints';

// Auth Service
export { authService } from './authService';
export type { LoginCredentials, User, LoginResponse, AuthResponse } from './authService';

// Product Service
export { productService } from './productService';
export type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductsResponse,
  ProductResponse,
} from './productService';

// Sales Service
export { salesService } from './salesService';
export type {
  SalesInvoice,
  SalesInvoiceItem,
  CreateSalesInvoiceRequest,
  SalesInvoiceResponse,
  SalesInvoicesResponse,
  SalesSummary,
} from './salesService';

// Other Services
export * from './customerService';
export * from './supplierService';
export * from './categoryService';
export * from './settingsService';
export * from './purchaseService';
export * from './debtExpenseService';
export * from './userRoleService';
export * from './reportService';
