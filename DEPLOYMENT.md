# دليل النشر على الاستضافة
# Deployment Guide

## 📋 المتطلبات الأساسية / Prerequisites

### Backend (Laravel)
- PHP 8.1 أو أحدث
- Composer
- MySQL 5.7 أو أحدث
- Extension: BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML

### Frontend (React)
- Node.js 18 أو أحدث
- npm أو yarn

---

## ⚙️ إعداد Backend

### 1. نسخ ملف البيئة
```bash
cd backend
cp .env.example .env
```

### 2. تحديث ملف `.env`
**مهم جداً:** قم بتغيير هذه القيم:

```env
# اسم التطبيق
APP_NAME=SmartPOS

# البيئة (production للاستضافة)
APP_ENV=production

# إيقاف وضع التطوير
APP_DEBUG=false

# رابط الموقع (غير هذا إلى رابط استضافتك)
APP_URL=https://yourdomain.com

# إعدادات قاعدة البيانات
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
```

### 3. تثبيت المكتبات
```bash
composer install --optimize-autoloader --no-dev
```

### 4. توليد مفتاح التطبيق
```bash
php artisan key:generate
```

### 5. تشغيل قاعدة البيانات
```bash
php artisan migrate --force
php artisan db:seed --force
```

### 6. إنشاء رابط التخزين
```bash
php artisan storage:link
```

### 7. تحسين الأداء
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## ⚙️ إعداد Frontend

### 1. نسخ ملف البيئة
```bash
cd frontend
cp .env.example .env.production
```

### 2. تحديث ملف `.env.production`
**مهم جداً:** قم بتغيير هذه القيمة:

```env
# رابط API (غير هذا إلى رابط الـ Backend الخاص بك)
VITE_API_BASE_URL=https://yourdomain.com/api

# أو إذا كان API على نطاق فرعي:
# VITE_API_BASE_URL=https://api.yourdomain.com/api

VITE_ENV=production
VITE_APP_NAME=
VITE_APP_VERSION=1.0.0
```

### 3. تثبيت المكتبات
```bash
npm install
```

### 4. بناء المشروع
```bash
npm run build
```

سيتم إنشاء مجلد `dist` يحتوي على الملفات الجاهزة للنشر.

---

## 🌐 رفع الملفات على الاستضافة

### Backend
1. ارفع جميع ملفات مجلد `backend` إلى الاستضافة
2. تأكد من أن مجلد `public` هو الـ Document Root
3. تأكد من أن المجلدات التالية قابلة للكتابة:
   - `storage/`
   - `bootstrap/cache/`

### Frontend
1. ارفع محتويات مجلد `dist` إلى الاستضافة
2. أو استخدم خدمات مثل Vercel, Netlify, Cloudflare Pages

---

## 🔒 الأمان

### Backend
1. تأكد من أن ملف `.env` غير قابل للوصول من المتصفح
2. قم بتعطيل `APP_DEBUG=false` في الإنتاج
3. استخدم HTTPS فقط
4. قم بتحديث `APP_KEY` بشكل دوري

### Frontend
1. تأكد من استخدام HTTPS
2. لا تضع أي معلومات حساسة في ملفات `.env`

---

## 📝 ملاحظات مهمة

### لا توجد مسارات ثابتة في الكود
✅ جميع المسارات تأتي من ملفات `.env`
✅ Backend يستخدم `APP_URL` من `.env`
✅ Frontend يستخدم `VITE_API_BASE_URL` من `.env`

### إعدادات التطبيق
✅ اسم الشركة والشعار يتم إدارتهم من لوحة الإعدادات في التطبيق
✅ لا توجد بيانات افتراضية في الكود

---

## 🆘 استكشاف الأخطاء

### خطأ 500 في Backend
- تحقق من صلاحيات المجلدات
- تحقق من إعدادات قاعدة البيانات
- راجع ملف `storage/logs/laravel.log`

### خطأ في الاتصال بـ API
- تحقق من `VITE_API_BASE_URL` في Frontend
- تحقق من `APP_URL` في Backend
- تأكد من تفعيل CORS

### الصور لا تظهر
- تأكد من تشغيل `php artisan storage:link`
- تحقق من صلاحيات مجلد `storage`
- تحقق من `APP_URL` في `.env`

---

## 📞 الدعم

للمزيد من المساعدة، راجع الوثائق:
- [Laravel Deployment](https://laravel.com/docs/deployment)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
