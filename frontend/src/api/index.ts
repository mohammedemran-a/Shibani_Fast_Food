// API Client
export { default as apiClient } from './apiClient';

// Endpoints
export * from './endpoints';

// Auth Service
export { authService } from './authService';
export type { LoginCredentials, User, LoginResponse, AuthResponse } from './authService';

// ===================================================================
// Product Service (الجزء المُصحح)
// ===================================================================
export {
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getPosProducts,
  searchProducts, // ✅ تم إضافة الدالة المفقودة هنا
} from './productService';

// نقوم بتصدير الأنواع الجديدة التي عرفناها في ملف types/index.ts
export type { Product, Category, Modifier, Ingredient, PosProduct, CartItem } from '@/types';
// ===================================================================

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
