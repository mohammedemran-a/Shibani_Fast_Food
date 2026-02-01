// frontend/src/api/analyticsService.ts

import apiClient from './apiClient';

// =================================================================
// أنواع بيانات أداء المنتجات (Product Performance Types)
// =================================================================

export interface PerformanceProduct {
  id: number;
  name: string;
  sku: string;
  current_stock?: number;
  total_quantity: number;
  total_revenue: number;
  total_profit?: number;
}

export interface StockStatusProduct {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  reorder_level: number;
}

export interface InventorySummary {
  total_products: number;
  active_products: number;
  inactive_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_quantity: number;
}

export interface InventoryValue {
  by_purchase_price: number;
  by_selling_price: number;
  potential_profit: number;
}

export interface DistributionStat {
  id: number;
  name: string;
  products_count: number;
  total_quantity: number;
  total_value: number;
}

export interface ProductPerformanceData {
  summary: InventorySummary;
  top_selling_by_quantity: PerformanceProduct[];
  top_selling_by_revenue: PerformanceProduct[];
  most_profitable: PerformanceProduct[];
  inventory_value: InventoryValue;
  low_stock: StockStatusProduct[];
  out_of_stock: StockStatusProduct[];
  by_category: DistributionStat[];
  by_brand: DistributionStat[];
}

export interface AnalyticsQueryOptions {
  startDate?: string;
  endDate?: string;
  limit?: number;
  categoryId?: number;
  brandId?: number;
}

// =================================================================
// **1. إضافة أنواع بيانات تحليل السلة (Basket Analysis Types)**
// =================================================================

/**
 * يمثل زوجًا من المنتجات التي يتم شراؤها معًا بشكل متكرر.
 */
export interface BasketPair {
  productA: string;
  productB: string;
  pair_count: number; // عدد المرات التي ظهر فيها الزوج معًا
  percentage: number; // نسبة ظهور هذا الزوج من إجمالي الفواتير
}

/**
 * يمثل خيارات الاستعلام لـ API تحليل السلة.
 */
export interface BasketAnalysisQueryOptions {
  startDate?: string;
  endDate?: string;
  limit?: number;
  minSupport?: number;
}

// =================================================================
// خدمات الـ API
// =================================================================

/**
 * يجلب بيانات تحليل أداء المنتجات من الـ API.
 * 
 * @param options - كائن يحتوي على خيارات التصفية.
 * @returns Promise يحتوي على بيانات تحليل أداء المنتجات.
 */
export const getProductPerformanceAnalytics = async (
  options: AnalyticsQueryOptions = {}
): Promise<ProductPerformanceData> => {
  try {
    const response = await apiClient.get<{ data: ProductPerformanceData }>('/analytics/products', {
      params: options,
    });
    return response.data.data;
  } catch (error: any) {
    console.error('API Error fetching product performance:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch product performance data.');
  }
};

// =================================================================
// **2. إضافة دالة خدمة تحليل السلة**
// =================================================================

/**
 * يجلب بيانات تحليل السلة (أزواج المنتجات) من الـ API.
 * 
 * @param options - كائن يحتوي على خيارات التصفية مثل التواريخ والحد الأدنى للدعم.
 * @returns Promise يحتوي على مصفوفة من أزواج المنتجات.
 */
export const getBasketAnalysis = async (
  options: BasketAnalysisQueryOptions = {}
): Promise<BasketPair[]> => {
  try {
    const response = await apiClient.get<{ data: BasketPair[] }>('/analytics/basket', {
      params: options,
    });
    // الـ API الخاص بنا يرجع البيانات مباشرة داخل مفتاح `data`
    return response.data.data;
  } catch (error: any) {
    console.error('API Error fetching basket analysis:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch basket analysis data.');
  }
};
