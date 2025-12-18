# API Integration Guide - Smart POS

## 🎯 نظرة عامة

هذا الدليل يشرح كيفية استخدام خدمات الـ API في مشروع React.

---

## 📁 بنية مجلد API

```
src/api/
├── apiClient.ts          # إعدادات Axios الرئيسية
├── endpoints.ts          # جميع نقاط النهاية
├── authService.ts        # خدمات المصادقة
├── productService.ts     # خدمات المنتجات
├── salesService.ts       # خدمات المبيعات
└── index.ts             # تصدير جميع الخدمات
```

---

## 🔐 المصادقة (Authentication)

### تسجيل الدخول

```typescript
import { authService } from '@/api';

const handleLogin = async () => {
  try {
    const response = await authService.login({
      email: 'admin@smartpos.com',
      password: 'admin123',
    });

    if (response.success) {
      // التوكن يتم حفظه تلقائياً في localStorage
      console.log('User:', response.data.user);
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### تسجيل الخروج

```typescript
const handleLogout = async () => {
  try {
    await authService.logout();
    navigate('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

### الحصول على بيانات المستخدم الحالي

```typescript
const user = authService.getUser();
console.log(user.name, user.email, user.role);
```

### التحقق من الصلاحيات

```typescript
// التحقق من وجود صلاحية معينة
if (authService.hasPermission('create_products')) {
  // عرض زر إضافة منتج
}

// التحقق من الدور
if (authService.hasRole('Super Admin')) {
  // عرض خيارات الإدارة
}
```

---

## 📦 المنتجات (Products)

### الحصول على قائمة المنتجات

```typescript
import { productService } from '@/api';

const fetchProducts = async () => {
  try {
    const response = await productService.getProducts({
      search: 'كركم',
      category_id: 1,
      per_page: 20,
      page: 1,
    });

    console.log(response.data.data); // المنتجات
    console.log(response.data.total); // إجمالي المنتجات
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
};
```

### إضافة منتج جديد

```typescript
const addProduct = async () => {
  try {
    const response = await productService.createProduct({
      name: 'Turmeric',
      name_ar: 'الكركم',
      sku: 'TUR-001',
      barcode: '123456789',
      category_id: 1,
      brand_id: 1,
      unit_id: 1,
      purchase_price: 50,
      selling_price: 100,
      quantity: 100,
      reorder_level: 20,
      expiry_date: '2026-12-31',
    });

    console.log('Product created:', response.data);
  } catch (error) {
    console.error('Failed to create product:', error);
  }
};
```

### تعديل منتج

```typescript
const updateProduct = async (productId: number) => {
  try {
    const response = await productService.updateProduct(productId, {
      name: 'Updated Name',
      selling_price: 120,
    });

    console.log('Product updated:', response.data);
  } catch (error) {
    console.error('Failed to update product:', error);
  }
};
```

### البحث عن منتج بالباركود

```typescript
const searchByBarcode = async (barcode: string) => {
  try {
    const response = await productService.searchByBarcode(barcode);
    const product = response.data.data[0];
    console.log('Found product:', product);
  } catch (error) {
    console.error('Product not found:', error);
  }
};
```

### الحصول على المنتجات ذات المخزون المنخفض

```typescript
const getLowStock = async () => {
  try {
    const response = await productService.getLowStockProducts();
    console.log('Low stock products:', response.data.data);
  } catch (error) {
    console.error('Failed to fetch low stock products:', error);
  }
};
```

---

## 🛒 المبيعات (Sales)

### إنشاء فاتورة بيع

```typescript
import { salesService } from '@/api';

const createSalesInvoice = async () => {
  try {
    const response = await salesService.createSalesInvoice({
      customer_id: 1,
      invoice_date: '2025-12-18',
      items: [
        {
          product_id: 1,
          quantity: 5,
          unit_price: 100,
        },
        {
          product_id: 2,
          quantity: 3,
          unit_price: 50,
        },
      ],
      payment_method: 'cash',
      discount_amount: 50,
      tax_amount: 30,
      notes: 'Customer order',
    });

    console.log('Invoice created:', response.data);
  } catch (error) {
    console.error('Failed to create invoice:', error);
  }
};
```

### الحصول على ملخص المبيعات اليومي

```typescript
const getDailySummary = async () => {
  try {
    const response = await salesService.getDailySummary('2025-12-18');
    console.log('Daily sales:', response.data);
  } catch (error) {
    console.error('Failed to fetch daily summary:', error);
  }
};
```

### الحصول على ملخص المبيعات الشهري

```typescript
const getMonthlySummary = async () => {
  try {
    const response = await salesService.getMonthlySummary('2025-12');
    console.log('Monthly sales:', response.data);
  } catch (error) {
    console.error('Failed to fetch monthly summary:', error);
  }
};
```

---

## 🔧 استخدام apiClient مباشرة

إذا كنت تريد استخدام Axios مباشرة:

```typescript
import { apiClient } from '@/api';

// GET request
const fetchData = async () => {
  try {
    const response = await apiClient.get('/products');
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// POST request
const postData = async () => {
  try {
    const response = await apiClient.post('/products', {
      name: 'New Product',
      price: 100,
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// PUT request
const updateData = async () => {
  try {
    const response = await apiClient.put('/products/1', {
      name: 'Updated Product',
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// DELETE request
const deleteData = async () => {
  try {
    const response = await apiClient.delete('/products/1');
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🌍 متغيرات البيئة

### Development
```
VITE_API_BASE_URL=http://localhost:8000/api
```

### Production
```
VITE_API_BASE_URL=https://api.smartpos.com/api
```

---

## 🔄 Interceptors

### Request Interceptor
يتم إضافة التوكن تلقائياً لكل طلب:

```typescript
// في apiClient.ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor
معالجة الأخطاء تلقائياً:

```typescript
// في apiClient.ts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // إعادة توجيه لصفحة تسجيل الدخول
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 📝 معالجة الأخطاء

```typescript
try {
  const response = await productService.getProducts();
  console.log(response.data);
} catch (error: any) {
  const errorMessage = error.response?.data?.message || 'An error occurred';
  const statusCode = error.response?.status;

  if (statusCode === 401) {
    console.log('Unauthorized - please login again');
  } else if (statusCode === 403) {
    console.log('Access denied');
  } else if (statusCode === 404) {
    console.log('Resource not found');
  } else if (statusCode === 500) {
    console.log('Server error');
  } else {
    console.log('Error:', errorMessage);
  }
}
```

---

## 🎯 أمثلة عملية

### مثال 1: صفحة المنتجات مع البحث

```typescript
import { useEffect, useState } from 'react';
import { productService } from '@/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getProducts({ search });
        setProducts(response.data.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>{product.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### مثال 2: نموذج إضافة منتج

```typescript
import { useState } from 'react';
import { productService } from '@/api';
import { useToast } from '@/hooks/use-toast';

export default function AddProductForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    sku: '',
    barcode: '',
    purchase_price: 0,
    selling_price: 0,
    quantity: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await productService.createProduct(formData);
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
      // Reset form
      setFormData({
        name: '',
        name_ar: '',
        sku: '',
        barcode: '',
        purchase_price: 0,
        selling_price: 0,
        quantity: 0,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create product',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 📞 الدعم والمساعدة

إذا واجهت أي مشاكل في الربط، تأكد من:

1. ✅ أن خادم Laravel يعمل على `http://localhost:8000`
2. ✅ أن متغيرات البيئة صحيحة في `.env.development`
3. ✅ أن التوكن يتم حفظه بشكل صحيح في localStorage
4. ✅ أن الصلاحيات موجودة في قاعدة البيانات

---

**آخر تحديث:** 18 ديسمبر 2025
