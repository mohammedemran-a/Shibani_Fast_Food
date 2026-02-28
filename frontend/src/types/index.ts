// src/types/index.ts

// يمثل شكل الوحدة القابلة للبيع كما تأتي من الـ API الذكي الذي بنيناه
export interface SellableUnit {
    product_id: number;
    product_name: string;
    barcode_id: number;
    unit_name: string;
    barcode: string;
    selling_price: number;
    conversion_factor: number;
    stock_in_this_unit: number;
    image_url: string;
}

// يمثل شكل المنتج الكامل كما يأتي من الـ API لنقطة البيع
export interface PosProduct {
    id: number;
    name: string;
    image_url: string;
    total_stock_in_base_units: number;
    sellable_units: SellableUnit[];
}

// يمثل شكل العنصر داخل سلة التسوق
// لاحظ أنه يرث من SellableUnit ويضيف حقل الكمية
export interface CartItem extends SellableUnit {
    quantity: number;
}

// يمثل شكل العميل
export interface Customer {
    id: number;
    name: string;
    phone?: string;
}

/**
 * ✅ ===================================================================
 * ✅ الحل: إضافة تعريف وتصدير النوع 'Category'
 * ✅ ===================================================================
 */
export interface Category {
    id: number | string; // استخدام 'string' يجعله متوافقًا مع خيار "الكل"
    name: string;
    description?: string | null;
}
