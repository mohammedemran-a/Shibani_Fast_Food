# Smart POS System

نظام نقطة بيع ذكي متكامل مع واجهة خلفية Laravel وواجهة أمامية React.

## 📋 المحتويات

- **Backend (Laravel API)** - الواجهة الخلفية
- **Frontend (React + TypeScript)** - الواجهة الأمامية

---

## 🚀 المميزات

### ✨ الواجهة الخلفية (Laravel)
- ✅ Laravel Sanctum للمصادقة
- ✅ نظام أدوار وصلاحيات متقدم (5 أدوار، 60+ صلاحية)
- ✅ 28 جدول في قاعدة البيانات
- ✅ 40+ API Endpoint
- ✅ 15+ Controller
- ✅ بيانات تجريبية جاهزة

### ✨ الواجهة الأمامية (React)
- ✅ React 18 + TypeScript
- ✅ Vite للبناء السريع
- ✅ TailwindCSS + Shadcn/ui
- ✅ React Query لإدارة البيانات
- ✅ React Router للتنقل
- ✅ دعم اللغة العربية والإنجليزية
- ✅ الوضع الليلي والنهاري

---

## 📦 الميزات الرئيسية

### 🛒 نقطة البيع (POS)
- مسح الباركود
- إضافة منتجات للسلة
- حساب الإجمالي والضرائب
- طرق دفع متعددة (نقدي، محفظة، دين)
- طباعة الفواتير

### 📊 إدارة المخزون
- إضافة وتعديل المنتجات
- الفئات والعلامات التجارية
- تتبع المخزون
- تنبيهات المخزون المنخفض
- تواريخ الانتهاء

### 💰 المبيعات والمشتريات
- فواتير المبيعات
- فواتير المشتريات
- المرتجعات
- تقارير الأرباح

### 👥 إدارة العملاء والموردين
- قاعدة بيانات العملاء
- قاعدة بيانات الموردين
- نظام نقاط الولاء
- إدارة الديون

### 📈 التقارير والتحليلات
- تقرير الأرباح
- تقرير المبيعات
- تقرير المشتريات
- تحليل الأداء
- الملخصات اليومية والشهرية

### 👤 إدارة المستخدمين
- نظام أدوار وصلاحيات
- 5 أدوار محددة مسبقاً
- 60+ صلاحية قابلة للتخصيص
- تتبع نشاط المستخدمين

---

## 🔧 التثبيت

### المتطلبات
- PHP 8.1+
- Composer
- MySQL 8.0+
- Node.js 18+
- npm أو yarn

### 1. الواجهة الخلفية (Backend)

```bash
cd backend

# تثبيت المكتبات
composer install

# نسخ ملف البيئة
cp .env.example .env

# توليد مفتاح التطبيق
php artisan key:generate

# إعداد قاعدة البيانات في .env
DB_DATABASE=smart_pos_db
DB_USERNAME=root
DB_PASSWORD=

# تشغيل الـ Migrations والـ Seeders
php artisan migrate --seed

# تشغيل الخادم
php artisan serve
```

الخادم سيعمل على: `http://localhost:8000`

### 2. الواجهة الأمامية (Frontend)

```bash
cd frontend

# تثبيت المكتبات
npm install

# نسخ ملف البيئة
cp .env.example .env.development

# تشغيل التطبيق
npm run dev
```

التطبيق سيعمل على: `http://localhost:5173`

---

## 🔑 بيانات الدخول التجريبية

| الدور | البريد الإلكتروني | كلمة المرور |
|------|-----------------|-----------|
| **Super Admin** | admin@smartpos.com | admin123 |
| **Manager** | manager@smartpos.com | manager123 |
| **Cashier 1** | cashier1@smartpos.com | cashier123 |
| **Cashier 2** | cashier2@smartpos.com | cashier123 |

---

## 📁 هيكل المشروع

```
smart-pos-system/
├── backend/              # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── API_DOCUMENTATION.md
│
└── frontend/             # React App
    ├── src/
    │   ├── api/          # خدمات الـ API
    │   ├── components/   # المكونات
    │   ├── pages/        # الصفحات
    │   ├── contexts/     # السياقات
    │   └── hooks/        # الـ Hooks
    ├── public/
    └── package.json
```

---

## 🔗 API Endpoints

جميع الـ Endpoints موثقة في:
- `backend/API_DOCUMENTATION.md`

### أمثلة:

```
POST   /api/auth/login              # تسجيل الدخول
GET    /api/products                # جلب المنتجات
POST   /api/products                # إضافة منتج
GET    /api/sales                   # جلب المبيعات
POST   /api/sales                   # إنشاء فاتورة بيع
GET    /api/reports/dashboard       # إحصائيات لوحة التحكم
GET    /api/reports/profit          # تقرير الأرباح
```

---

## 🛡️ الأمان

- ✅ Laravel Sanctum للمصادقة
- ✅ Token-based authentication
- ✅ نظام صلاحيات متقدم
- ✅ حماية CSRF
- ✅ Validation شامل
- ✅ معالجة أخطاء احترافية

---

## 🌍 اللغات المدعومة

- 🇸🇦 العربية
- 🇬🇧 الإنجليزية

---

## 🎨 التصميم

- **UI Library:** Shadcn/ui
- **CSS Framework:** TailwindCSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Animations:** Framer Motion

---

## 📚 التوثيق

- **API Documentation:** `backend/API_DOCUMENTATION.md`
- **Integration Guide:** `frontend/API_INTEGRATION_GUIDE.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`

---

## 🤝 المساهمة

هذا مشروع خاص. للمساهمة، يرجى التواصل مع المالك.

---

## 📄 الترخيص

جميع الحقوق محفوظة © 2025

---

## 📞 الدعم

للدعم والاستفسارات، يرجى فتح Issue في المستودع.

---

**تم التطوير بواسطة:** Ezaddeen  
**آخر تحديث:** 18 ديسمبر 2025
