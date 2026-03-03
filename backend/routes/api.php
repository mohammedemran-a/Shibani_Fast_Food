<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// استيراد جميع المتحكمات
use App\Http\Controllers\Api\AuthController;
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
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\InventoryController; // ✅ [إضافة] استيراد متحكم المخزون

// استيراد متحكمات المنتجات الجديدة
use App\Http\Controllers\Api\Product\ListProductsController;
use App\Http\Controllers\Api\Product\StoreProductController;
use App\Http\Controllers\Api\Product\ShowProductController;
use App\Http\Controllers\Api\Product\UpdateProductController;
use App\Http\Controllers\Api\Product\DestroyProductController;
use App\Http\Controllers\Api\Product\SearchProductsController;
use App\Http\Controllers\Api\Product\GetPosProductsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/user', fn(Request $request) => $request->user());
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

    // Users & Employees
    Route::apiResource('users', UserController::class);
    Route::post('users/{id}/toggle-active', [UserController::class, 'toggleActive']);
    Route::apiResource('employees', EmployeeController::class);
    Route::get('unlinked-users', [EmployeeController::class, 'getUnlinkedUsers']);

    // Search
    Route::get('/search/products-for-purchase', [SearchController::class, 'searchProductsForPurchase']);

    // Products
    Route::get('/products', [ListProductsController::class, '__invoke']);
    Route::post('/products', [StoreProductController::class, '__invoke']);
    Route::get('/products/search', [SearchProductsController::class, '__invoke']);
    Route::get('/products/{product}', [ShowProductController::class, '__invoke'])->where('product', '[0-9]+');
    Route::put('/products/{product}', [UpdateProductController::class, '__invoke']);
    Route::delete('/products/{product}', [DestroyProductController::class, '__invoke']);
    Route::get('/pos/products', [GetPosProductsController::class, '__invoke']);
    Route::post('products/import', [ImportController::class, 'importProducts']);

    // ✅✅✅ [إضافة] مسار المخزون الجديد ✅✅✅
    // ===================================================================
    Route::get('/inventory', [InventoryController::class, 'index']);
    // ===================================================================

    // Categories, Brands, Units, Currencies
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('brands', BrandController::class);
    Route::apiResource('units', UnitController::class);
    Route::apiResource('currencies', CurrencyController::class);

    // Settings
    Route::get('settings', [SettingsController::class, 'index']);
    Route::post('settings', [SettingsController::class, 'update']);
    Route::post('settings/logo', [SettingsController::class, 'uploadLogo']);
    Route::get('settings/{key}', [SettingsController::class, 'getSetting']);

    // Sales & Returns
    Route::apiResource('sales-invoices', SalesInvoiceController::class);
    Route::post('sales-invoices/{invoice}/cancel', [SalesInvoiceController::class, 'cancel']);
    Route::apiResource('product-returns', ProductReturnController::class);
    Route::post('product-returns/{return}/approve', [ProductReturnController::class, 'approve']);
    Route::post('product-returns/{return}/reject', [ProductReturnController::class, 'reject']);

    // Purchases & Returns
    Route::apiResource('purchase-invoices', PurchaseInvoiceController::class);
    Route::get('purchase-invoices/{id}/items-for-return', [PurchaseInvoiceController::class, 'getItemsForReturn']);
    Route::apiResource('returns', ReturnController::class);
    Route::get('returns/invoice/{invoiceId}/available-items', [ReturnController::class, 'getAvailableItems']);
    Route::post('returns/{id}/update-status', [ReturnController::class, 'updateStatus']);

    // People
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('suppliers', SupplierController::class);

    // Debts
    Route::apiResource('debts', DebtController::class);
    Route::post('debts/{debt}/payment', [DebtController::class, 'recordPayment']);
    Route::get('/customer-debts-summary', [DebtController::class, 'getDebtsSummary']);
    Route::post('/debts/pay', [DebtController::class, 'storePayment']);
    Route::get('/customers/{customer}/debts', [CustomerController::class, 'getDebtDetails']);

    // Expenses
    Route::apiResource('expenses', ExpenseController::class);

    // Attendance
    Route::apiResource('attendances', AttendanceController::class);
    Route::post('attendances/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('attendances/check-out', [AttendanceController::class, 'checkOut']);
    Route::get('attendances/statistics/{userId}', [AttendanceController::class, 'statistics']);

    // Sales Performance
    Route::get('sales-performance', [SalesPerformanceController::class, 'index']);
    Route::get('sales-performance/{userId}', [SalesPerformanceController::class, 'show']);

    // Roles & Permissions
    Route::get('permissions', [RoleController::class, 'getAllPermissions']);
    Route::apiResource('roles', RoleController::class);
    Route::post('roles/{role}/permissions', [RoleController::class, 'updatePermissions']);

    // Dashboard & Analytics
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

    // Payment Methods
    Route::apiResource('payment-methods', PaymentMethodController::class);
    Route::post('payment-methods/{id}/toggle-active', [PaymentMethodController::class, 'toggleActive']);
    Route::get('payment-methods-active', [PaymentMethodController::class, 'active']);

    // Reports
    Route::get('reports/profit', [ReportController::class, 'profitReport']);
    Route::get('reports/sales', [ReportController::class, 'salesReport']);
    Route::get('reports/purchases', [ReportController::class, 'purchasesReport']);
    Route::get('reports/inventory', [ReportController::class, 'inventoryReport']);
    Route::get('reports/cashier-performance', [ReportController::class, 'cashierPerformance']);
    Route::get('reports/product-performance', [ReportController::class, 'productPerformance']);
    Route::get('reports/dashboard', [ReportController::class, 'dashboardMetrics']);
});
