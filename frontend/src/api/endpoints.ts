// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  REFRESH_TOKEN: '/auth/refresh-token',
};

// Products Endpoints
export const PRODUCTS_ENDPOINTS = {
  LIST: '/products',
  CREATE: '/products',
  GET: (id: number) => `/products/${id}`,
  UPDATE: (id: number) => `/products/${id}`,
  DELETE: (id: number) => `/products/${id}`,
  IMPORT: '/products/import',
  GENERATE_BARCODE: (id: number) => `/products/${id}/barcode`,
};

// Categories Endpoints
export const CATEGORIES_ENDPOINTS = {
  LIST: '/categories',
  CREATE: '/categories',
  GET: (id: number) => `/categories/${id}`,
  UPDATE: (id: number) => `/categories/${id}`,
  DELETE: (id: number) => `/categories/${id}`,
};

// Brands Endpoints
export const BRANDS_ENDPOINTS = {
  LIST: '/brands',
  CREATE: '/brands',
  GET: (id: number) => `/brands/${id}`,
  UPDATE: (id: number) => `/brands/${id}`,
  DELETE: (id: number) => `/brands/${id}`,
};

// Units Endpoints
export const UNITS_ENDPOINTS = {
  LIST: '/units',
  CREATE: '/units',
  GET: (id: number) => `/units/${id}`,
  UPDATE: (id: number) => `/units/${id}`,
  DELETE: (id: number) => `/units/${id}`,
};

// Currencies Endpoints
export const CURRENCIES_ENDPOINTS = {
  LIST: '/currencies',
  CREATE: '/currencies',
  GET: (id: number) => `/currencies/${id}`,
  UPDATE: (id: number) => `/currencies/${id}`,
  DELETE: (id: number) => `/currencies/${id}`,
};

// Settings Endpoints
export const SETTINGS_ENDPOINTS = {
  LIST: '/settings',
  UPDATE: '/settings',
  UPLOAD_LOGO: '/settings/logo',
  GET: (key: string) => `/settings/${key}`,
};

// Sales Invoices Endpoints
export const SALES_INVOICES_ENDPOINTS = {
  LIST: '/sales-invoices',
  CREATE: '/sales-invoices',
  GET: (id: number) => `/sales-invoices/${id}`,
  UPDATE: (id: number) => `/sales-invoices/${id}`,
  DELETE: (id: number) => `/sales-invoices/${id}`,
  CANCEL: (id: number) => `/sales-invoices/${id}/cancel`,
  DAILY_SUMMARY: '/sales-invoices/summary/daily',
  WEEKLY_SUMMARY: '/sales-invoices/summary/weekly',
  MONTHLY_SUMMARY: '/sales-invoices/summary/monthly',
};

// Purchase Invoices Endpoints
export const PURCHASE_INVOICES_ENDPOINTS = {
  LIST: '/purchase-invoices',
  CREATE: '/purchase-invoices',
  GET: (id: number) => `/purchase-invoices/${id}`,
  UPDATE: (id: number) => `/purchase-invoices/${id}`,
  DELETE: (id: number) => `/purchase-invoices/${id}`,
  CANCEL: (id: number) => `/purchase-invoices/${id}/cancel`,
  DAILY_SUMMARY: '/purchase-invoices/summary/daily',
  WEEKLY_SUMMARY: '/purchase-invoices/summary/weekly',
  MONTHLY_SUMMARY: '/purchase-invoices/summary/monthly',
};

// Customers Endpoints
export const CUSTOMERS_ENDPOINTS = {
  LIST: '/customers',
  CREATE: '/customers',
  GET: (id: number) => `/customers/${id}`,
  UPDATE: (id: number) => `/customers/${id}`,
  DELETE: (id: number) => `/customers/${id}`,
};

// Suppliers Endpoints
export const SUPPLIERS_ENDPOINTS = {
  LIST: '/suppliers',
  CREATE: '/suppliers',
  SHOW: (id: number) => `/suppliers/${id}`,
  GET: (id: number) => `/suppliers/${id}`,
  UPDATE: (id: number) => `/suppliers/${id}`,
  DELETE: (id: number) => `/suppliers/${id}`,
};

// Debts Endpoints
export const DEBTS_ENDPOINTS = {
  LIST: '/debts',
  CREATE: '/debts',
  GET: (id: number) => `/debts/${id}`,
  UPDATE: (id: number) => `/debts/${id}`,
  DELETE: (id: number) => `/debts/${id}`,
  PAYMENT: (id: number) => `/debts/${id}/payment`,
  PENDING_SUMMARY: '/debts/summary/pending',
};

// Expenses Endpoints
export const EXPENSES_ENDPOINTS = {
  LIST: '/expenses',
  CREATE: '/expenses',
  GET: (id: number) => `/expenses/${id}`,
  UPDATE: (id: number) => `/expenses/${id}`,
  DELETE: (id: number) => `/expenses/${id}`,
  DAILY_SUMMARY: '/expenses/summary/daily',
  WEEKLY_SUMMARY: '/expenses/summary/weekly',
  MONTHLY_SUMMARY: '/expenses/summary/monthly',
};

// Returns Endpoints
export const RETURNS_ENDPOINTS = {
  LIST: '/returns',
  CREATE: '/returns',
  GET: (id: number) => `/returns/${id}`,
  UPDATE: (id: number) => `/returns/${id}`,
  DELETE: (id: number) => `/returns/${id}`,
  APPROVE: (id: number) => `/returns/${id}/approve`,
  REJECT: (id: number) => `/returns/${id}/reject`,
};

// Users Endpoints
export const USERS_ENDPOINTS = {
  LIST: '/users',
  CREATE: '/users',
  GET: (id: number) => `/users/${id}`,
  UPDATE: (id: number) => `/users/${id}`,
  DELETE: (id: number) => `/users/${id}`,
  DEACTIVATE: (id: number) => `/users/${id}/deactivate`,
  ACTIVATE: (id: number) => `/users/${id}/activate`,
};

// Roles Endpoints
export const ROLES_ENDPOINTS = {
  LIST: '/roles',
  CREATE: '/roles',
  GET: (id: number) => `/roles/${id}`,
  UPDATE: (id: number) => `/roles/${id}`,
  DELETE: (id: number) => `/roles/${id}`,
  UPDATE_PERMISSIONS: (id: number) => `/roles/${id}/permissions`,
};

// Reports Endpoints
export const REPORTS_ENDPOINTS = {
  PROFIT: '/reports/profit',
  SALES: '/reports/sales',
  PURCHASES: '/reports/purchases',
  INVENTORY: '/reports/inventory',
  CASHIER_PERFORMANCE: '/reports/cashier-performance',
  PRODUCT_PERFORMANCE: '/reports/product-performance',
  DASHBOARD: '/reports/dashboard',
};
