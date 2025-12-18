# Smart POS API Documentation

## نظام نقاط البيع الذكي - توثيق الـ API

---

## 🔐 المصادقة (Authentication)

### تسجيل الدخول
**POST** `/api/auth/login`

**Request Body:**
```json
{
    "email": "admin@smartpos.com",
    "password": "admin123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "name": "Super Admin",
            "email": "admin@smartpos.com",
            "phone": "+966500000000",
            "avatar": null,
            "role": "Super Admin",
            "role_ar": "مسؤول النظام",
            "permissions": ["view_products", "create_products", ...]
        },
        "token": "1|abc123xyz..."
    }
}
```

### تسجيل الخروج
**POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer {token}`

### الحصول على بيانات المستخدم الحالي
**GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer {token}`

---

## 📦 المنتجات (Products)

### الحصول على قائمة المنتجات
**GET** `/api/products`

**Query Parameters:**
- `search` - البحث عن منتج
- `category_id` - تصفية حسب الفئة
- `brand_id` - تصفية حسب العلامة التجارية
- `is_active` - تصفية المنتجات النشطة
- `per_page` - عدد النتائج في الصفحة (افتراضي: 15)

**Example:**
```
GET /api/products?search=كركم&category_id=1&per_page=20
```

### إضافة منتج جديد
**POST** `/api/products`

**Request Body:**
```json
{
    "name": "Turmeric",
    "name_ar": "الكركم",
    "sku": "TUR-001",
    "barcode": "123456789",
    "category_id": 1,
    "brand_id": 1,
    "unit_id": 1,
    "purchase_price": 50,
    "selling_price": 100,
    "quantity": 100,
    "reorder_level": 20,
    "expiry_date": "2026-12-31",
    "description": "Premium turmeric powder"
}
```

### تعديل منتج
**PUT/PATCH** `/api/products/{id}`

### حذف منتج
**DELETE** `/api/products/{id}`

---

## 🏷️ الفئات (Categories)

### الحصول على جميع الفئات
**GET** `/api/categories`

### إضافة فئة جديدة
**POST** `/api/categories`

**Request Body:**
```json
{
    "name": "Spices",
    "name_ar": "التوابل",
    "description": "All kinds of spices"
}
```

### تعديل فئة
**PUT/PATCH** `/api/categories/{id}`

### حذف فئة
**DELETE** `/api/categories/{id}`

---

## 🏢 العلامات التجارية (Brands)

### الحصول على جميع العلامات التجارية
**GET** `/api/brands`

### إضافة علامة تجارية جديدة
**POST** `/api/brands`

**Request Body:**
```json
{
    "name": "Premium Spices",
    "name_ar": "التوابل الممتازة",
    "description": "High quality spices"
}
```

### تعديل علامة تجارية
**PUT/PATCH** `/api/brands/{id}`

### حذف علامة تجارية
**DELETE** `/api/brands/{id}`

---

## 📏 الوحدات (Units)

### الحصول على جميع الوحدات
**GET** `/api/units`

### إضافة وحدة جديدة
**POST** `/api/units`

**Request Body:**
```json
{
    "name": "Kilogram",
    "name_ar": "كيلوجرام",
    "abbreviation": "kg"
}
```

### تعديل وحدة
**PUT/PATCH** `/api/units/{id}`

### حذف وحدة
**DELETE** `/api/units/{id}`

---

## 💱 العملات (Currencies)

### الحصول على جميع العملات
**GET** `/api/currencies`

### إضافة عملة جديدة
**POST** `/api/currencies`

**Request Body:**
```json
{
    "name": "Saudi Riyal",
    "code": "SAR",
    "symbol": "﷼",
    "exchange_rate": 1,
    "is_default": true
}
```

---

## 🛒 المبيعات (Sales Invoices)

### الحصول على قائمة الفواتير
**GET** `/api/sales-invoices`

### إنشاء فاتورة بيع جديدة
**POST** `/api/sales-invoices`

**Request Body:**
```json
{
    "customer_id": 1,
    "cashier_id": 2,
    "invoice_date": "2025-12-18",
    "items": [
        {
            "product_id": 1,
            "quantity": 5,
            "unit_price": 100
        }
    ],
    "payment_method": "cash",
    "wallet_name": null,
    "transaction_code": null,
    "discount_amount": 0,
    "tax_amount": 0
}
```

### ملخص المبيعات اليومي
**GET** `/api/sales-invoices/summary/daily`

### ملخص المبيعات الأسبوعي
**GET** `/api/sales-invoices/summary/weekly`

### ملخص المبيعات الشهري
**GET** `/api/sales-invoices/summary/monthly`

---

## 📥 المشتريات (Purchase Invoices)

### الحصول على قائمة فواتير الشراء
**GET** `/api/purchase-invoices`

### إنشاء فاتورة شراء جديدة
**POST** `/api/purchase-invoices`

**Request Body:**
```json
{
    "supplier_id": 1,
    "invoice_date": "2025-12-18",
    "due_date": "2026-01-18",
    "items": [
        {
            "product_id": 1,
            "quantity": 50,
            "unit_price": 50
        }
    ],
    "total_amount": 2500,
    "notes": "Order from supplier"
}
```

---

## 👥 العملاء (Customers)

### الحصول على قائمة العملاء
**GET** `/api/customers`

### إضافة عميل جديد
**POST** `/api/customers`

**Request Body:**
```json
{
    "name": "Ahmed Mohammed",
    "name_ar": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "+966500000000",
    "address": "123 Main Street",
    "city": "Riyadh",
    "country": "Saudi Arabia"
}
```

---

## 🏭 الموردين (Suppliers)

### الحصول على قائمة الموردين
**GET** `/api/suppliers`

### إضافة مورد جديد
**POST** `/api/suppliers`

**Request Body:**
```json
{
    "name": "Premium Spice Co.",
    "name_ar": "شركة التوابل الممتازة",
    "email": "info@spices.com",
    "phone": "+966500000001",
    "address": "456 Business Ave",
    "city": "Jeddah",
    "country": "Saudi Arabia"
}
```

---

## 💰 الديون (Debts)

### الحصول على قائمة الديون
**GET** `/api/debts`

### تسجيل دفعة دين
**POST** `/api/debts/{debt_id}/payment`

**Request Body:**
```json
{
    "amount": 500,
    "payment_date": "2025-12-18",
    "payment_method": "cash",
    "transaction_code": "TRX123456",
    "notes": "Partial payment"
}
```

### ملخص الديون المعلقة
**GET** `/api/debts/summary/pending`

---

## 💸 المصروفات (Expenses)

### الحصول على قائمة المصروفات
**GET** `/api/expenses`

### إضافة مصروف جديد
**POST** `/api/expenses`

**Request Body:**
```json
{
    "description": "Rent",
    "description_ar": "الإيجار",
    "amount": 5000,
    "expense_date": "2025-12-18",
    "notes": "Monthly rent"
}
```

### ملخص المصروفات اليومي
**GET** `/api/expenses/summary/daily`

### ملخص المصروفات الأسبوعي
**GET** `/api/expenses/summary/weekly`

### ملخص المصروفات الشهري
**GET** `/api/expenses/summary/monthly`

---

## 🔄 المرتجعات (Returns)

### الحصول على قائمة المرتجعات
**GET** `/api/returns`

### إنشاء مرتجع جديد
**POST** `/api/returns`

**Request Body:**
```json
{
    "purchase_invoice_id": 1,
    "supplier_id": 1,
    "return_date": "2025-12-18",
    "items": [
        {
            "product_id": 1,
            "quantity": 10,
            "unit_price": 50
        }
    ],
    "reason": "Defective products"
}
```

### الموافقة على مرتجع
**POST** `/api/returns/{id}/approve`

### رفض مرتجع
**POST** `/api/returns/{id}/reject`

---

## 👤 المستخدمين (Users)

### الحصول على قائمة المستخدمين
**GET** `/api/users`

### إضافة مستخدم جديد
**POST** `/api/users`

**Request Body:**
```json
{
    "name": "New Cashier",
    "email": "cashier@smartpos.com",
    "password": "password123",
    "phone": "+966500000002",
    "role_id": 3
}
```

### تعطيل مستخدم
**POST** `/api/users/{id}/deactivate`

### تفعيل مستخدم
**POST** `/api/users/{id}/activate`

---

## 🔐 الأدوار والصلاحيات (Roles & Permissions)

### الحصول على قائمة الأدوار
**GET** `/api/roles`

### تحديث صلاحيات دور
**POST** `/api/roles/{id}/permissions`

**Request Body:**
```json
{
    "permission_ids": [1, 2, 3, 4, 5]
}
```

---

## 📊 لوحة التحكم والتحليلات (Dashboard & Analytics)

### لوحة التحكم الرئيسية
**GET** `/api/dashboard`

**Response:**
```json
{
    "success": true,
    "data": {
        "sales": {...},
        "purchases": {...},
        "products": {...},
        "people": {...},
        "profit": {...},
        "expenses": {...},
        "top_products": [...],
        "sales_chart": [...],
        "purchases_chart": [...],
        "last_updated": "2024-01-01 12:00:00"
    }
}
```

**ملاحظة:** البيانات يتم تخزينها مؤقتاً (Cache) لمدة 5 دقائق لتحسين الأداء.

---

### تحليلات المبيعات
**GET** `/api/analytics/sales`

**Query Parameters:**
- `start_date` - تاريخ البداية (اختياري)
- `end_date` - تاريخ النهاية (اختياري)

**Response:**
```json
{
    "success": true,
    "data": {
        "summary": {...},
        "by_customer": [...],
        "by_payment_method": [...],
        "by_status": [...],
        "daily_trend": [...],
        "monthly_comparison": [...]
    }
}
```

---

### تحليلات المشتريات
**GET** `/api/analytics/purchases`

**Query Parameters:**
- `start_date` - تاريخ البداية (اختياري)
- `end_date` - تاريخ النهاية (اختياري)

---

### تحليلات المنتجات
**GET** `/api/analytics/products`

**Response:**
```json
{
    "success": true,
    "data": {
        "summary": {...},
        "by_category": [...],
        "by_brand": [...],
        "low_stock": [...],
        "out_of_stock": [...],
        "top_selling": [...],
        "inventory_value": {...}
    }
}
```

---

### أفضل العملاء
**GET** `/api/analytics/top-customers`

**Query Parameters:**
- `limit` - عدد العملاء (افتراضي: 10)

---

### أفضل الموردين
**GET** `/api/analytics/top-suppliers`

**Query Parameters:**
- `limit` - عدد الموردين (افتراضي: 10)

---

### حركة منتج معين
**GET** `/api/analytics/product-movement/{productId}`

---

### مسح الذاكرة المؤقتة
**POST** `/api/analytics/clear-cache`

---

### تحديث الذاكرة المؤقتة
**POST** `/api/analytics/refresh-cache`

---

## 📊 التقارير (Reports)

### تقرير الأرباح
**GET** `/api/reports/profit`

**Query Parameters:**
- `start_date` - تاريخ البداية
- `end_date` - تاريخ النهاية
- `period` - الفترة (daily, weekly, monthly)

### تقرير المبيعات
**GET** `/api/reports/sales`

### تقرير المشتريات
**GET** `/api/reports/purchases`

### تقرير المخزون
**GET** `/api/reports/inventory`

### أداء الكاشيرين
**GET** `/api/reports/cashier-performance`

### أداء المنتجات
**GET** `/api/reports/product-performance`

### مقاييس لوحة التحكم
**GET** `/api/reports/dashboard`

---

## 🔑 بيانات الدخول التجريبية

### Super Admin
- **البريد الإلكتروني:** `admin@smartpos.com`
- **كلمة المرور:** `admin123`

### Cashier 1
- **البريد الإلكتروني:** `cashier1@smartpos.com`
- **كلمة المرور:** `cashier123`

### Cashier 2
- **البريد الإلكتروني:** `cashier2@smartpos.com`
- **كلمة المرور:** `cashier123`

### Manager
- **البريد الإلكتروني:** `manager@smartpos.com`
- **كلمة المرور:** `manager123`

---

## 🚀 بدء الخادم

```bash
cd /home/ubuntu/smart-pos-api
php artisan serve
```

سيبدأ الخادم على: `http://localhost:8000`

---

## 📝 ملاحظات مهمة

1. جميع الطلبات (ما عدا تسجيل الدخول) تتطلب رمز المصادقة (Token)
2. يجب إضافة الرمز في الـ Header: `Authorization: Bearer {token}`
3. جميع الاستجابات بصيغة JSON
4. الأخطاء يتم إرجاعها برسالة واضحة ورمز HTTP مناسب
5. جميع التواريخ بصيغة `YYYY-MM-DD`

---

## 🔗 الربط مع الواجهة الأمامية (React)

سيتم إنشاء مجلد `api` في مشروع React يحتوي على:
- `apiClient.js` - إعدادات الـ HTTP Client
- `endpoints.js` - جميع نقاط النهاية
- `interceptors.js` - معالجات الأخطاء والمصادقة

---

**آخر تحديث:** 18 ديسمبر 2025
