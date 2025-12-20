# 🔄 إعادة هيكلة قاعدة البيانات

## 📋 ملخص التغييرات

تم إعادة هيكلة قاعدة البيانات بالكامل لإزالة التكرار وتحسين التنظيم.

---

## ✅ ما تم إنجازه

### 1️⃣ **فصل Migrations الكبيرة**

**قبل:**
- ملف واحد كبير يحتوي على 20 جدول (289 سطر)
- `2024_12_18_000001_create_system_tables.php`

**بعد:**
- 20 ملف منفصل، كل جدول في ملف خاص به
- سهولة الصيانة والتطوير
- تنظيم أفضل

**قائمة الجداول:**
1. `units` - الوحدات
2. `currencies` - العملات
3. `categories` - الفئات
4. `brands` - العلامات التجارية
5. `products` - المنتجات
6. `stock_movements` - حركات المخزون
7. `suppliers` - الموردين
8. `purchase_invoices` - فواتير الشراء
9. `purchase_invoice_items` - تفاصيل فواتير الشراء
10. `returns` - المرتجعات
11. `return_items` - تفاصيل المرتجعات
12. `customers` - العملاء
13. `sales_invoices` - فواتير المبيعات
14. `sales_invoice_items` - تفاصيل فواتير المبيعات
15. `debts` - الديون
16. `debt_payments` - دفعات الديون
17. `expenses` - المصروفات
18. `cashier_sessions` - جلسات الكاشير
19. `loyalty_points` - نقاط الولاء
20. `system_settings` - إعدادات النظام

---

### 2️⃣ **إزالة التكرار**

#### ❌ حذف الجداول المكررة:
- `purchase_returns` (كان مكرر)
- استخدام جدول `returns` الموجود أصلاً

#### ❌ حذف Migrations المكررة:
- `2025_12_20_023029_add_tax_discount_to_purchase_invoices_table.php`
- `2025_12_20_023100_create_purchase_returns_table.php`

#### ✅ تحديث جدول `purchase_invoices`:
أضيفت الحقول التالية مباشرة في migration الأصلي:
```php
$table->decimal('subtotal', 12, 2)->default(0);
$table->decimal('tax_amount', 12, 2)->default(0);
$table->decimal('discount_amount', 12, 2)->default(0);
```

---

### 3️⃣ **توحيد حقول الأسماء**

#### ❌ حذف الحقول المكررة:
- `description_ar` من جدول `expenses`
- جميع حقول `_ar` من الجداول

#### ✅ استخدام حقل واحد فقط:
```php
$table->string('name'); // يمكن إدخال عربي أو إنجليزي
$table->string('description'); // يمكن إدخال عربي أو إنجليزي
```

**الفائدة:**
- لا حاجة للترجمة
- مرونة أكبر للمستخدم
- تقليل التعقيد

---

### 4️⃣ **تحديث Models**

#### ✅ Models الجديدة:
- `Return.php` (بدلاً من `PurchaseReturn.php`)
- `ReturnItem.php`

#### ✅ Models المحدثة:
- `PurchaseInvoice.php` - تحديث علاقة `returns()`
- `PurchaseInvoiceItem.php` - إضافة دوال حساب الكميات

---

### 5️⃣ **تحديث Controllers**

#### ✅ Controllers الجديدة:
- `ReturnController.php` (بدلاً من `PurchaseReturnController.php`)

**الدوال الرئيسية:**
```php
index()                    // قائمة المرتجعات
show($id)                  // تفاصيل مرتجع
getAvailableItems($invoiceId)  // المنتجات المتاحة للإرجاع
store(Request $request)    // إنشاء مرتجع
updateStatus($id)          // تحديث حالة المرتجع
destroy($id)               // حذف مرتجع
```

---

### 6️⃣ **تحديث Routes**

#### ❌ القديم:
```php
Route::apiResource('purchase-returns', PurchaseReturnController::class);
Route::apiResource('returns', ProductReturnController::class);
```

#### ✅ الجديد:
```php
// مرتجعات المشتريات (للموردين)
Route::apiResource('returns', ReturnController::class);
Route::get('returns/invoice/{invoiceId}/available-items', [ReturnController::class, 'getAvailableItems']);
Route::post('returns/{id}/update-status', [ReturnController::class, 'updateStatus']);

// مرتجعات المبيعات (من العملاء)
Route::apiResource('product-returns', ProductReturnController::class);
```

**التوضيح:**
- `/returns` → مرتجعات المشتريات للموردين
- `/product-returns` → مرتجعات المبيعات من العملاء

---

### 7️⃣ **تحديث Frontend Services**

#### ✅ تحديث `purchaseReturnService.ts`:
```typescript
// الـ endpoints الجديدة
getPurchaseReturns()           → GET /returns
getPurchaseReturn(id)          → GET /returns/{id}
getAvailableItemsForReturn(id) → GET /returns/invoice/{id}/available-items
createPurchaseReturn(data)     → POST /returns
updateReturnStatus(id, status) → POST /returns/{id}/update-status
deletePurchaseReturn(id)       → DELETE /returns/{id}
```

---

## 📊 مقارنة قبل وبعد

### قبل:
```
❌ 1 migration كبير (289 سطر)
❌ جداول مكررة (purchase_returns + returns)
❌ حقول مكررة (description + description_ar)
❌ Models مكررة (PurchaseReturn)
❌ Controllers مكررة (PurchaseReturnController)
❌ Routes غير منظمة
```

### بعد:
```
✅ 20 migration منفصل (منظم)
✅ جدول واحد للمرتجعات (returns)
✅ حقل واحد للأسماء (name)
✅ Model واحد (Return)
✅ Controller واحد (ReturnController)
✅ Routes واضحة ومنظمة
```

---

## 🎯 الفوائد

### 1. **سهولة الصيانة**
- كل جدول في ملف منفصل
- سهولة تعديل أي جدول دون التأثير على الآخرين

### 2. **إزالة التكرار**
- لا توجد جداول مكررة
- لا توجد حقول مكررة
- كود أنظف وأقل تعقيداً

### 3. **مرونة أكبر**
- حقل واحد للاسم يقبل عربي أو إنجليزي
- لا حاجة للترجمة

### 4. **أداء أفضل**
- حقول أقل = استعلامات أسرع
- جداول أقل = قاعدة بيانات أخف

### 5. **توثيق أفضل**
- تعليقات عربية شاملة
- شرح واضح لكل جدول وحقل

---

## 🚀 خطوات التطبيق

### 1. حذف قاعدة البيانات القديمة (اختياري)
```bash
php artisan migrate:fresh
```

### 2. تشغيل Migrations الجديدة
```bash
php artisan migrate
```

### 3. اختبار النظام
- إنشاء فاتورة شراء
- إنشاء مرتجع
- التحقق من الكميات المتاحة

---

## 📝 ملاحظات مهمة

### ⚠️ Breaking Changes:

1. **API Endpoints:**
   - `/purchase-returns` → `/returns`
   - يجب تحديث Frontend

2. **Model Names:**
   - `PurchaseReturn` → `Return`
   - يجب تحديث جميع الاستيرادات

3. **Database:**
   - يجب تشغيل `migrate:fresh` لتطبيق التغييرات

---

## ✅ Checklist

- [x] فصل migrations إلى ملفات منفصلة
- [x] حذف الجداول المكررة
- [x] حذف الحقول المكررة (description_ar)
- [x] توحيد حقول الأسماء
- [x] تحديث Models
- [x] تحديث Controllers
- [x] تحديث Routes
- [x] تحديث Frontend Services
- [x] إضافة تعليقات عربية شاملة
- [ ] اختبار شامل للنظام

---

## 🎓 مثال عملي

### إنشاء مرتجع:

```typescript
// Frontend
const createReturn = async () => {
  const data = {
    purchase_invoice_id: 1,
    return_date: '2023-12-20',
    items: [
      { product_id: 5, quantity: 10 },
      { product_id: 8, quantity: 5 }
    ],
    reason: 'منتجات تالفة',
    notes: 'ملاحظات إضافية'
  };
  
  await purchaseReturnService.createPurchaseReturn(data);
};
```

```php
// Backend
POST /api/returns
{
  "purchase_invoice_id": 1,
  "return_date": "2023-12-20",
  "items": [
    { "product_id": 5, "quantity": 10 },
    { "product_id": 8, "quantity": 5 }
  ],
  "reason": "منتجات تالفة",
  "notes": "ملاحظات إضافية"
}
```

---

**الحالة:** ✅ مكتمل
**التالي:** اختبار شامل ورفع التعديلات
