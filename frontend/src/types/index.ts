// ===================================================================
// 1. أنواع البيانات الأساسية (الكيانات)
// ===================================================================

export interface Category {
  id: number;
  name: string;
}

export interface Modifier {
  id: number;
  name: string;
  price: number;
}

export interface Ingredient {
  id: number;
  name: string;
  pivot: { quantity: number; };
}

export interface Product {
  id: number;
  name: string;
  type: 'Sellable' | 'RawMaterial';
  price: number | null;
  cost: number | null;
  stock: number | null;
  unit: string | null;
  is_active: boolean;
  image_url?: string | null;
  category?: Category;
  ingredients?: Ingredient[];
  availableModifiers?: Modifier[];
}

// ===================================================================
// 2. أنواع بيانات الطلبات والسلة (لشاشة نقطة البيع)
// ===================================================================

export interface PosProduct {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  modifiers: Modifier[];
}

export interface CartItem extends PosProduct {
  cartItemId: string;
  quantity: number;
  notes?: string;
  selectedModifiers?: Modifier[];
}

export enum OrderType {
  Takeaway = 'سفري',
  Delivery = 'توصيل',
  DineIn = 'محلي',
}

export enum DiscountType {
  None,
  Percentage,
  FixedAmount,
}

// ===================================================================
// 3. أنواع استجابات الـ API وأخرى
// ===================================================================

/**
 * ✅✅✅ تم توسيع الواجهة لتشمل كل حقول Laravel Pagination ✅✅✅
 */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page?: number;
  from?: number;
  to?: number;
  first_page_url?: string;
  last_page_url?: string;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  path?: string;
}

/**
 * ✅✅✅ تم إضافة الواجهة المفقودة هنا ✅✅✅
 */
export interface ProductFilters {
  name?: string;
  type?: 'Sellable' | 'RawMaterial' | '';
  page?: number;
}

/**
 * ✅✅✅ تم إضافة التعريف الجديد هنا ✅✅✅
 */
export type ProductPayload = Partial<Omit<Product, 'id' | 'category' | 'ingredients' | 'availableModifiers'>> & {
  ingredients?: { id: number; quantity: number }[];
  category_id?: number;
  image?: File | null;
  _method?: 'PUT';
  is_active: 0 | 1;
};
