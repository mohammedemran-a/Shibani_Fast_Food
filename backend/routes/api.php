<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
// use App\Http\Controllers\Api\ProductController; // لم نعد بحاجة لهذا
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\CurrencyController;
use App\Http\Controllers\Api\SalesInvoiceController;
use App\Http\Controllers\Api\PurchaseInvoiceController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\DebtController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ProductReturnController;
use App\Http\Controllers\Api\ReturnController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\SalesPerformanceController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SearchController;

// ✅ استيراد الـ Controllers الجديدة الخاصة بالمنتجات
use App\Http\Controllers\Api\Product\ListProductsController;
use App\Http\Controllers\Api\Product\StoreProductController;
use App\Http\Controllers\Api\Product\ShowProductController;
use App\Http\Controllers\Api\Product\UpdateProductController;
use App\Http\Controllers\Api\Product\DestroyProductController;
use App\Http\Controllers\Api\Product\SearchProductsController;
use App\Http\Controllers\Api\Product\GetPosProductsController; // <-- تم تصحيح الاسم

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/user', fn(Request $request) => $request->user());

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

    // مسارات البحث المخصصة
    Route::get('/search/products-for-purchase', [SearchController::class, 'searchProductsForPurchase']);

    // ✅✅✅ مسارات المنتجات الجديدة والمُصححة ✅✅✅
    // ===================================================================
    // تم تعديل هذه الأسطر لتحديد الدالة __invoke بشكل صريح
    Route::get('/products', [ListProductsController::class, '__invoke']);
    Route::post('/products', [StoreProductController::class, '__invoke']);
    Route::get('/products/search', [SearchProductsController::class, '__invoke']);
    Route::get('/products/{product}', [ShowProductController::class, '__invoke'])->where('product', '[0-9]+');
    Route::put('/products/{product}', [UpdateProductController::class, '__invoke']);
    Route::delete('/products/{product}', [DestroyProductController::class, '__invoke']);
    Route::get('/pos/products', [GetPosProductsController::class, '__invoke']); // <-- تم تصحيح اسم الـ Controller والدالة
    // ===================================================================

    Route::post('products/import', [ImportController::class, 'importProducts']);

    // ... (كل المسارات الأخرى من هنا وحتى نهاية الملف تبقى بدون أي تغيير)
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('brands', BrandController::class);
    Route::apiResource('units', UnitController::class);
    Route::apiResource('currencies', CurrencyController::class);
    Route::get('settings', [SettingsController::class, 'index']);
    Route::post('settings', [SettingsController::class, 'update']);
    Route::post('settings/logo', [SettingsController::class, 'uploadLogo']);
    Route::get('settings/{key}', [SettingsController::class, 'getSetting']);
    Route::apiResource('sales-invoices', SalesInvoiceController::class);
    Route::post('sales-invoices/{invoice}/cancel', [SalesInvoiceController::class, 'cancel']);
    Route::get('sales-invoices/summary/daily', [SalesInvoiceController::class, 'dailySummary']);
    Route::get('sales-invoices/summary/weekly', [SalesInvoiceController::class, 'weeklySummary']);
    Route::get('sales-invoices/summary/monthly', [SalesInvoiceController::class, 'monthlySummary']);
    Route::apiResource('purchase-invoices', PurchaseInvoiceController::class);
    Route::get('purchase-invoices/{id}/items-for-return', [PurchaseInvoiceController::class, 'getItemsForReturn']);
    Route::apiResource('returns', ReturnController::class);
    Route::get('returns/invoice/{invoiceId}/available-items', [ReturnController::class, 'getAvailableItems']);
    Route::post('returns/{id}/update-status', [ReturnController::class, 'updateStatus']);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('debts', DebtController::class);
    Route::post('debts/{debt}/payment', [DebtController::class, 'recordPayment']);
    Route::get('debts/summary/pending', [DebtController::class, 'pendingSummary']);
    Route::get('/customer-debts-summary', [App\Http\Controllers\Api\DebtController::class, 'getDebtsSummary']);
    Route::post('/debts/pay', [App\Http\Controllers\Api\DebtController::class, 'storePayment']);
    Route::get('/customers/{customer}/debts', [App\Http\Controllers\Api\CustomerController::class, 'getDebtDetails']);
    Route::get('expenses/summary', [ExpenseController::class, 'getSummary']);
    Route::get('expenses/summary/daily', [ExpenseController::class, 'dailySummary']);
    Route::get('expenses/summary/weekly', [ExpenseController::class, 'weeklySummary']);
    Route::get('expenses/summary/monthly', [ExpenseController::class, 'monthlySummary']);
    Route::get('expenses/category/{category}', [ExpenseController::class, 'getByCategory']);
    Route::apiResource('expenses', ExpenseController::class);
    Route::apiResource('product-returns', ProductReturnController::class);
    Route::post('product-returns/{return}/approve', [ProductReturnController::class, 'approve']);
    Route::post('product-returns/{return}/reject', [ProductReturnController::class, 'reject']);
    Route::apiResource('users', UserController::class);
    Route::post('users/{id}/toggle-active', [UserController::class, 'toggleActive']);
    Route::apiResource('attendances', AttendanceController::class);
    Route::post('attendances/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('attendances/check-out', [AttendanceController::class, 'checkOut']);
    Route::get('attendances/statistics/{userId}', [AttendanceController::class, 'statistics']);
    Route::get('sales-performance', [SalesPerformanceController::class, 'index']);
    Route::get('sales-performance/{userId}', [SalesPerformanceController::class, 'show']);
    Route::get('sales-performance/top-performers/list', [SalesPerformanceController::class, 'topPerformers']);
    Route::post('sales-performance/compare', [SalesPerformanceController::class, 'compare']);
    Route::get('permissions', [RoleController::class, 'getAllPermissions']);
    Route::apiResource('roles', RoleController::class);
    Route::post('roles/{role}/permissions', [RoleController::class, 'updatePermissions']);
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::prefix('analytics')->group(function () {
        Route::get('sales', [AnalyticsController::class, 'sales']);
        Route::get('purchases', [AnalyticsController::class, 'purchases']);
        Route::get('products', [AnalyticsController::class, 'products']);
        Route::get('top-customers', [AnalyticsController::class, 'topCustomers']);
        Route::get('top-suppliers', [AnalyticsController::class, 'topSuppliers']);
        Route::get('product-movement/{productId}', [AnalyticsController::class, 'productMovement']);
        Route::post('clear-cache', [AnalyticsController::class, 'clearCache']);
        Route::post('refresh-cache', [AnalyticsController::class, 'refreshCache']);
        Route::get('basket', [AnalyticsController::class, 'basketAnalysis']);
    });
    Route::apiResource('payment-methods', PaymentMethodController::class);
    Route::post('payment-methods/{id}/toggle-active', [PaymentMethodController::class, 'toggleActive']);
    Route::get('payment-methods-active', [PaymentMethodController::class, 'active']);
    Route::get('reports/profit', [ReportController::class, 'profitReport']);
    Route::get('reports/sales', [ReportController::class, 'salesReport']);
    Route::get('reports/purchases', [ReportController::class, 'purchasesReport']);
    Route::get('reports/inventory', [ReportController::class, 'inventoryReport']);
    Route::get('reports/cashier-performance', [ReportController::class, 'cashierPerformance']);
    Route::get('reports/product-performance', [ReportController::class, 'productPerformance']);
    Route::get('reports/dashboard', [ReportController::class, 'dashboardMetrics']);
});
