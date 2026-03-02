// ===================================================================
// أنواع البيانات الأساسية
// ===================================================================

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Modifier {
  id: string;
  name: string;
  price: number;
}

export interface Ingredient {
  id: string;
  name: string;
}

export interface RestaurantProduct {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  availableModifiers?: Modifier[];
  baseIngredients?: Ingredient[];
}

// ===================================================================
// أنواع بيانات الطلبات والسلة
// ===================================================================

export interface RestaurantCartItem extends RestaurantProduct {
  cartItemId: string; 
  quantity: number;
  notes?: string;
  selectedModifiers?: Modifier[];
  excludedIngredients?: Ingredient[];
}

export enum OrderType {
  Takeaway = 'سفري',
  Delivery = 'توصيل',
  DineIn = 'محلي',
  Apps = 'تطبيقات',
}

// ✅✅✅ الخطوة 1: إضافة تعريف DiscountType هنا ✅✅✅
export enum DiscountType {
  None,
  Percentage,
  FixedAmount,
}
