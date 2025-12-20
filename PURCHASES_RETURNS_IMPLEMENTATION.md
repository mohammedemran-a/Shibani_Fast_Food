# دليل تطبيق نظام المشتريات والمرتجعات

## 📋 نظرة عامة

تم تطبيق نظام كامل لإدارة المشتريات والمرتجعات مع:
- ✅ ترقيم تلقائي للفواتير والمرتجعات
- ✅ دعم الضريبة والخصم على الفواتير
- ✅ نظام مرتجعات ذكي يتتبع الكميات المباعة
- ✅ التحقق من الكميات المتاحة للإرجاع
- ✅ تعليقات عربية شاملة في جميع الملفات

---

## 🏗️ البنية التحتية

### 1. Backend Models

#### ✨ PurchaseInvoice.php
**الموقع:** `backend/app/Models/PurchaseInvoice.php`

**الحقول:**
- `invoice_number` - رقم الفاتورة (تلقائي: PUR-YYYYMMDD-XXXX)
- `supplier_id` - معرف المورد
- `invoice_date` - تاريخ الفاتورة
- `due_date` - تاريخ الاستحقاق
- `subtotal` - المجموع الفرعي (قبل الضريبة والخصم)
- `tax_amount` - قيمة الضريبة
- `discount_amount` - قيمة الخصم
- `total_amount` - المجموع الإجمالي
- `paid_amount` - المبلغ المدفوع
- `status` - الحالة (completed, pending, cancelled)

**الدوال المساعدة:**
- `getRemainingAmountAttribute()` - حساب المبلغ المتبقي
- `getPaymentStatusAttribute()` - حساب حالة الدفع (paid, partial, unpaid)
- `isFullyPaid()` - التحقق من الدفع الكامل
- `getReturnedQuantity($productId)` - حساب الكمية المرتجعة لمنتج
- `getAvailableReturnQuantity($productId)` - حساب الكمية المتاحة للإرجاع

**Scopes:**
- `scopeCompleted()` - الفواتير المكتملة
- `scopePending()` - الفواتير المعلقة
- `scopeCancelled()` - الفواتير الملغاة

---

#### ✨ PurchaseInvoiceItem.php
**الموقع:** `backend/app/Models/PurchaseInvoiceItem.php`

**الحقول:**
- `purchase_invoice_id` - معرف فاتورة الشراء
- `product_id` - معرف المنتج
- `quantity` - الكمية المشتراة
- `unit_price` - سعر الوحدة
- `total_price` - السعر الإجمالي

**Attributes المحسوبة:**
- `returned_quantity` - الكمية المرتجعة
- `sold_quantity` - الكمية المباعة بعد الشراء
- `available_return_quantity` - الكمية المتاحة للإرجاع

**المعادلة:**
```
الكمية المتاحة للإرجاع = الكمية الأصلية - الكمية المرتجعة - الكمية المباعة
```

---

#### ✨ PurchaseReturn.php
**الموقع:** `backend/app/Models/PurchaseReturn.php`

**الحقول:**
- `return_number` - رقم المرتجع (تلقائي: RET-YYYYMMDD-XXXX)
- `purchase_invoice_id` - معرف فاتورة الشراء الأصلية
- `product_id` - معرف المنتج المرتجع
- `quantity` - الكمية المرتجعة
- `unit_price` - سعر الوحدة
- `total_price` - السعر الإجمالي
- `reason` - سبب الإرجاع
- `return_date` - تاريخ الإرجاع
- `status` - الحالة (pending, approved, rejected)

**Scopes:**
- `scopeApproved()` - المرتجعات المعتمدة
- `scopePending()` - المرتجعات المعلقة
- `scopeRejected()` - المرتجعات المرفوضة

---

### 2. Backend Controllers

#### ✨ PurchaseInvoiceController.php
**الموقع:** `backend/app/Http/Controllers/Api/PurchaseInvoiceController.php`

**الوظائف:**

1. **`index()`** - عرض قائمة الفواتير
   - دعم الفلترة حسب التاريخ والمورد والحالة
   - البحث برقم الفاتورة
   - الترقيم الديناميكي

2. **`store()`** - إنشاء فاتورة جديدة
   - توليد رقم تلقائي (PUR-YYYYMMDD-XXXX)
   - حساب المجموع الفرعي والضريبة والخصم
   - إضافة الكميات للمخزون
   - استخدام Transaction لضمان سلامة البيانات

3. **`show()`** - عرض تفاصيل فاتورة
   - تحميل جميع العلاقات
   - حساب الكميات المتاحة للإرجاع لكل منتج

4. **`update()`** - تحديث فاتورة
   - تحديث المبلغ المدفوع والحالة

5. **`destroy()`** - حذف فاتورة
   - خصم الكميات من المخزون قبل الحذف

6. **`getItemsForReturn()`** - الحصول على المنتجات المتاحة للإرجاع
   - عرض الكمية الأصلية والمرتجعة والمباعة
   - حساب الكمية المتاحة للإرجاع

---

#### ✨ PurchaseReturnController.php
**الموقع:** `backend/app/Http/Controllers/Api/PurchaseReturnController.php`

**الوظائف:**

1. **`index()`** - عرض قائمة المرتجعات
   - الفلترة حسب التاريخ والفاتورة والحالة

2. **`store()`** - إنشاء مرتجع جديد
   - التحقق من الكمية المتاحة للإرجاع
   - التحقق من الكمية المباعة
   - توليد رقم تلقائي (RET-YYYYMMDD-XXXX)
   - خصم الكمية من المخزون

3. **`show()`** - عرض تفاصيل مرتجع

4. **`update()`** - تحديث حالة مرتجع
   - إرجاع الكمية للمخزون عند الرفض

5. **`destroy()`** - حذف مرتجع
   - إرجاع الكمية للمخزون

---

### 3. Database Migrations

#### Migration 1: إضافة حقول الضريبة والخصم
**الملف:** `2025_12_20_023029_add_tax_discount_to_purchase_invoices_table.php`

```php
$table->decimal('subtotal', 10, 2)->default(0);
$table->decimal('tax_amount', 10, 2)->default(0);
$table->decimal('discount_amount', 10, 2)->default(0);
```

#### Migration 2: إنشاء جدول المرتجعات
**الملف:** `2025_12_20_023100_create_purchase_returns_table.php`

**الحقول:**
- رقم المرتجع (unique)
- معرف الفاتورة (foreign key)
- معرف المنتج (foreign key)
- الكمية والأسعار
- السبب والملاحظات
- الحالة والتاريخ
- معرف المستخدم المنشئ

**الفهارس:**
- `(purchase_invoice_id, product_id)` - لتحسين الأداء
- `return_date` - للفلترة السريعة
- `status` - للفلترة حسب الحالة

---

### 4. API Routes

**الملف:** `backend/routes/api.php`

```php
// Purchase Invoices
Route::apiResource('purchase-invoices', PurchaseInvoiceController::class);
Route::get('purchase-invoices/{id}/items-for-return', [PurchaseInvoiceController::class, 'getItemsForReturn']);

// Purchase Returns
Route::apiResource('purchase-returns', PurchaseReturnController::class);
```

**Endpoints:**

**المشتريات:**
- `GET /api/purchase-invoices` - قائمة الفواتير
- `POST /api/purchase-invoices` - إنشاء فاتورة
- `GET /api/purchase-invoices/{id}` - تفاصيل فاتورة
- `PUT /api/purchase-invoices/{id}` - تحديث فاتورة
- `DELETE /api/purchase-invoices/{id}` - حذف فاتورة
- `GET /api/purchase-invoices/{id}/items-for-return` - المنتجات المتاحة للإرجاع

**المرتجعات:**
- `GET /api/purchase-returns` - قائمة المرتجعات
- `POST /api/purchase-returns` - إنشاء مرتجع
- `GET /api/purchase-returns/{id}` - تفاصيل مرتجع
- `PUT /api/purchase-returns/{id}` - تحديث مرتجع
- `DELETE /api/purchase-returns/{id}` - حذف مرتجع

---

### 5. Frontend Services

#### ✨ purchaseService.ts
**الموقع:** `frontend/src/api/purchaseService.ts`

**الوظائف:**
- `getPurchases()` - قائمة الفواتير مع فلترة
- `getPurchase()` - تفاصيل فاتورة
- `createPurchase()` - إنشاء فاتورة جديدة
- `updatePurchase()` - تحديث فاتورة
- `deletePurchase()` - حذف فاتورة
- `getItemsForReturn()` - المنتجات المتاحة للإرجاع

**Interfaces:**
```typescript
interface PurchaseInvoice {
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  // ... باقي الحقول
}

interface CreatePurchaseInvoiceData {
  supplier_id: number;
  invoice_date: string;
  items: PurchaseInvoiceItem[];
  tax_amount?: number;
  discount_amount?: number;
  paid_amount?: number;
}
```

---

#### ✨ purchaseReturnService.ts
**الموقع:** `frontend/src/api/purchaseReturnService.ts`

**الوظائف:**
- `getPurchaseReturns()` - قائمة المرتجعات
- `getPurchaseReturn()` - تفاصيل مرتجع
- `createPurchaseReturn()` - إنشاء مرتجع
- `updatePurchaseReturn()` - تحديث حالة مرتجع
- `deletePurchaseReturn()` - حذف مرتجع

---

## 🔄 آلية عمل النظام

### 1. إنشاء فاتورة شراء

```
1. المستخدم يدخل بيانات الفاتورة:
   - اختيار المورد
   - إضافة المنتجات مع الكميات والأسعار
   - إدخال الضريبة والخصم (اختياري)
   - المبلغ المدفوع (اختياري)

2. Backend يقوم بـ:
   ✅ حساب المجموع الفرعي = مجموع (الكمية × السعر) لكل منتج
   ✅ حساب المجموع الإجمالي = المجموع الفرعي + الضريبة - الخصم
   ✅ توليد رقم فاتورة تلقائي (PUR-20231220-0001)
   ✅ إنشاء الفاتورة وعناصرها
   ✅ إضافة الكميات للمخزون

3. النتيجة:
   ✅ فاتورة شراء مكتملة مع رقم تلقائي
   ✅ المخزون محدث
```

---

### 2. إنشاء مرتجع

```
1. المستخدم يختار:
   ✅ فاتورة الشراء من القائمة
   
2. النظام يعرض:
   ✅ جميع المنتجات في الفاتورة
   ✅ الكمية الأصلية لكل منتج
   ✅ الكمية المرتجعة سابقاً
   ✅ الكمية المباعة (مع علامة 🔴)
   ✅ الكمية المتاحة للإرجاع

3. المستخدم يختار:
   ✅ المنتج المراد إرجاعه
   ✅ الكمية (لا تتجاوز المتاح)
   ✅ سبب الإرجاع
   ✅ ملاحظات

4. Backend يقوم بـ:
   ✅ التحقق من الكمية المتاحة
   ✅ توليد رقم مرتجع تلقائي (RET-20231220-0001)
   ✅ إنشاء المرتجع
   ✅ خصم الكمية من المخزون

5. النتيجة:
   ✅ مرتجع مسجل بحالة "معلق"
   ✅ المخزون محدث
```

---

## 📊 مثال عملي

### سيناريو كامل:

```
1. شراء 100 قطعة من منتج X بسعر 10 ريال
   - المجموع الفرعي: 1000 ريال
   - الضريبة (15%): 150 ريال
   - الخصم: 50 ريال
   - المجموع الإجمالي: 1100 ريال
   - رقم الفاتورة: PUR-20231220-0001

2. بيع 30 قطعة من المنتج X

3. محاولة إرجاع 80 قطعة:
   ❌ مرفوض! الكمية المتاحة للإرجاع = 100 - 0 - 30 = 70 قطعة فقط
   
4. إرجاع 50 قطعة:
   ✅ مقبول! الكمية المتاحة = 70 قطعة
   - رقم المرتجع: RET-20231220-0001
   - السعر الإجمالي: 50 × 10 = 500 ريال

5. الوضع النهائي:
   - الكمية الأصلية: 100
   - الكمية المباعة: 30 🔴
   - الكمية المرتجعة: 50
   - الكمية المتاحة للإرجاع: 20
```

---

## 🚀 خطوات التشغيل

### 1. تشغيل Migrations

```bash
cd backend
php artisan migrate
```

### 2. التحقق من Routes

```bash
php artisan route:list | grep purchase
```

### 3. اختبار API

**إنشاء فاتورة شراء:**
```bash
curl -X POST http://localhost:8000/api/purchase-invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": 1,
    "invoice_date": "2023-12-20",
    "items": [
      {
        "product_id": 1,
        "quantity": 100,
        "unit_price": 10
      }
    ],
    "tax_amount": 150,
    "discount_amount": 50
  }'
```

**الحصول على المنتجات المتاحة للإرجاع:**
```bash
curl -X GET http://localhost:8000/api/purchase-invoices/1/items-for-return \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**إنشاء مرتجع:**
```bash
curl -X POST http://localhost:8000/api/purchase-returns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purchase_invoice_id": 1,
    "product_id": 1,
    "quantity": 50,
    "reason": "منتج تالف",
    "return_date": "2023-12-20"
  }'
```

---

## 📝 ملاحظات مهمة

### للمطورين:

1. **جميع التعليقات بالعربية** - لسهولة الفهم والصيانة
2. **استخدام Transactions** - في جميع العمليات الحساسة
3. **التحقق من الكميات** - قبل أي عملية إرجاع
4. **الترقيم التلقائي** - يعتمد على التاريخ والـ ID

### للاختبار:

1. تأكد من وجود موردين في قاعدة البيانات
2. تأكد من وجود منتجات
3. أنشئ فاتورة شراء
4. جرب بيع بعض المنتجات
5. حاول إرجاع كمية أكبر من المتاح (يجب أن يرفض)
6. أرجع كمية صحيحة

---

## 🎯 المميزات الرئيسية

✅ **ترقيم تلقائي ذكي** - PUR-YYYYMMDD-XXXX و RET-YYYYMMDD-XXXX
✅ **دعم الضريبة والخصم** - على مستوى الفاتورة
✅ **تتبع المبيعات** - لمنع إرجاع منتجات مباعة
✅ **حالات متعددة** - للفواتير والمرتجعات
✅ **إدارة المخزون** - تحديث تلقائي
✅ **تعليقات عربية شاملة** - في كل ملف
✅ **معالجة أخطاء قوية** - مع رسائل واضحة
✅ **أمان البيانات** - باستخدام Transactions

---

## 📞 الدعم

للأسئلة أو المساعدة:
- راجع التعليقات داخل الكود
- راجع هذا الملف
- تواصل مع فريق التطوير

---

**تاريخ التطبيق:** 20 ديسمبر 2025
**الحالة:** ✅ Backend مكتمل - Frontend قيد الإنشاء
