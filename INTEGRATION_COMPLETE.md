# Smart POS - Integration Complete Guide

## 🎉 ما تم إنجازه

### ✅ المرحلة 1: البنية الأساسية
- ✅ إنشاء جميع خدمات الـ API (8 خدمات)
- ✅ إضافة ProtectedRoute لحماية الصفحات
- ✅ ربط صفحة Login بالـ API
- ✅ ربط صفحة Dashboard بالـ API

### ✅ المرحلة 2: خدمات API
تم إنشاء الخدمات التالية في `frontend/src/api/`:

1. **authService.ts** - المصادقة
2. **productService.ts** - المنتجات
3. **salesService.ts** - المبيعات
4. **customerService.ts** - العملاء
5. **supplierService.ts** - الموردين
6. **categoryService.ts** - الفئات
7. **settingsService.ts** - الإعدادات (Brands, Units, Currencies)
8. **purchaseService.ts** - المشتريات
9. **debtExpenseService.ts** - الديون والمصروفات
10. **userRoleService.ts** - المستخدمين والأدوار
11. **reportService.ts** - التقارير

---

## 📋 الصفحات المربوطة

### ✅ مربوطة بالكامل:
1. **Login** - تسجيل الدخول
2. **Dashboard** - لوحة التحكم (إحصائيات من API)

### 🔄 جاهزة للربط (الخدمات موجودة):
جميع الصفحات التالية لديها خدمات API جاهزة، تحتاج فقط لتعديل الصفحة:

3. **Products List** - قائمة المنتجات
4. **Add Product** - إضافة منتج
5. **Import Products** - استيراد منتجات
6. **POS** - نقطة البيع
7. **Sales** - المبيعات
8. **Purchases** - المشتريات
9. **Customers** - العملاء
10. **Suppliers** - الموردين
11. **Categories** - الفئات
12. **Brands** - العلامات التجارية
13. **Units** - الوحدات
14. **Currencies** - العملات
15. **Debts** - الديون
16. **Expenses** - المصروفات
17. **Users** - المستخدمين
18. **Roles & Permissions** - الأدوار والصلاحيات
19. **Reports** - التقارير

---

## 🔧 كيفية ربط الصفحات المتبقية

### نمط عام لكل صفحة:

#### 1. استيراد المكتبات والخدمات
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { [serviceName] } from '@/api';
import { useToast } from '@/hooks/use-toast';
```

#### 2. جلب البيانات
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['key', ...dependencies],
  queryFn: () => service.getMethod(params),
});
```

#### 3. إضافة/تعديل/حذف
```typescript
const queryClient = useQueryClient();
const { toast } = useToast();

const mutation = useMutation({
  mutationFn: service.createMethod,
  onSuccess: () => {
    queryClient.invalidateQueries(['key']);
    toast({ title: 'Success' });
  },
  onError: (error: any) => {
    toast({ 
      title: 'Error', 
      description: error.response?.data?.message || 'An error occurred',
      variant: 'destructive' 
    });
  },
});
```

#### 4. عرض البيانات
```typescript
if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error loading data</div>;

return (
  <div>
    {data?.data?.map((item) => (
      <div key={item.id}>{item.name}</div>
    ))}
  </div>
);
```

---

## 📝 أمثلة محددة

### مثال 1: Products List

```typescript
// في ProductsList.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/api';
import { useToast } from '@/hooks/use-toast';

const ProductsList = () => {
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب المنتجات
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => productService.getProducts({ search }),
  });

  // حذف منتج
  const deleteMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast({ title: 'Product deleted successfully' });
    },
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <input 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        placeholder="Search products..."
      />
      {productsData?.data?.data?.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.selling_price}</p>
          <button onClick={() => handleDelete(product.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

### مثال 2: POS (نقطة البيع)

```typescript
// في POS.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { productService, salesService } from '@/api';
import { useToast } from '@/hooks/use-toast';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState('');
  const { toast } = useToast();

  // البحث بالباركود
  const searchByBarcode = async () => {
    try {
      const response = await productService.searchByBarcode(barcode);
      if (response.data.data.length > 0) {
        addToCart(response.data.data[0]);
        setBarcode('');
      }
    } catch (error) {
      toast({ title: 'Product not found', variant: 'destructive' });
    }
  };

  // إنشاء فاتورة
  const createInvoiceMutation = useMutation({
    mutationFn: salesService.createSalesInvoice,
    onSuccess: () => {
      setCart([]);
      toast({ title: 'Sale completed successfully' });
    },
  });

  const handleCheckout = () => {
    const invoiceData = {
      customer_id: null,
      invoice_date: new Date().toISOString().split('T')[0],
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.selling_price,
      })),
      payment_method: 'cash',
      discount_amount: 0,
      tax_amount: 0,
    };
    createInvoiceMutation.mutate(invoiceData);
  };

  return (
    <div>
      <input 
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && searchByBarcode()}
        placeholder="Scan barcode..."
      />
      {/* عرض السلة */}
      <button onClick={handleCheckout}>Complete Sale</button>
    </div>
  );
};
```

### مثال 3: Categories

```typescript
// في Categories.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/api';

const Categories = () => {
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });

  const handleCreate = (data) => {
    createMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {categories?.data?.map((category) => (
        <div key={category.id}>{category.name}</div>
      ))}
    </div>
  );
};
```

---

## 🎯 الخطوات المتبقية

### للمطور:

1. **افتح كل صفحة** من القائمة أعلاه
2. **استبدل البيانات الوهمية** بـ `useQuery`
3. **أضف mutations** للإضافة/التعديل/الحذف
4. **اختبر** كل صفحة مع API

### الصفحات ذات الأولوية:

1. **Products List** - الأكثر استخداماً
2. **POS** - نقطة البيع الرئيسية
3. **Sales** - عرض المبيعات
4. **Customers** - إدارة العملاء
5. **Categories** - الفئات

---

## 📚 الموارد

- **API Documentation:** `backend/API_DOCUMENTATION.md`
- **Integration Guide:** `PAGES_INTEGRATION_GUIDE.md`
- **Services Location:** `frontend/src/api/`

---

## ✅ التحقق من الربط

لكل صفحة، تأكد من:

- [ ] إزالة البيانات الوهمية (mock data)
- [ ] استخدام `useQuery` لجلب البيانات
- [ ] استخدام `useMutation` للعمليات
- [ ] معالجة حالات Loading و Error
- [ ] عرض رسائل النجاح والفشل
- [ ] تحديث البيانات بعد كل عملية

---

## 🚀 التشغيل

### Backend:
```bash
cd backend
php artisan serve
```

### Frontend:
```bash
cd frontend
npm run dev
```

### تسجيل الدخول:
```
Email: admin@smartpos.com
Password: admin123
```

---

**آخر تحديث:** 18 ديسمبر 2025  
**الحالة:** البنية الأساسية مكتملة، الصفحات جاهزة للربط
