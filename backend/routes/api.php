<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
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

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/products/import/template', [ProductController::class, 'downloadTemplate']);


// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

    // ===================================================================
    // Users & Employees Routes (Separated Logic)
    // ===================================================================

    // Users routes (for managing accounts)
    Route::apiResource('users', UserController::class);
    Route::post('users/{id}/toggle-active', [UserController::class, 'toggleActive']);

    // Employees routes (for managing employee-specific data)
    Route::apiResource('employees', EmployeeController::class);
    Route::get('unlinked-users', [EmployeeController::class, 'getUnlinkedUsers']);

    // ===================================================================
    // Other Application Routes
    // ===================================================================

    // Search Routes
    Route::get('/search/products-for-purchase', [SearchController::class, 'searchProductsForPurchase']);

    // Products routes
    Route::get('/products/search', [ProductController::class, 'search']);
    Route::apiResource('products', ProductController::class);
    Route::post('products/import', [ImportController::class, 'importProducts']);
    Route::post('products/{product}/barcode', [ProductController::class, 'generateBarcode']);
    Route::patch('products/{product}/status', [ProductController::class, 'updateStatus']);

    // Categories, Brands, Units, Currencies routes
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('brands', BrandController::class);
    Route::apiResource('units', UnitController::class);
    Route::apiResource('currencies', CurrencyController::class);

    // Settings routes
    Route::get('settings', [SettingsController::class, 'index']);
    Route::post('settings', [SettingsController::class, 'update']);
    Route::post('settings/logo', [SettingsController::class, 'uploadLogo']);
    Route::get('settings/{key}', [SettingsController::class, 'getSetting']);

    // Sales & Returns routes
    Route::apiResource('sales-invoices', SalesInvoiceController::class);
    Route::post('sales-invoices/{invoice}/cancel', [SalesInvoiceController::class, 'cancel']);
    Route::apiResource('product-returns', ProductReturnController::class);
    Route::post('product-returns/{return}/approve', [ProductReturnController::class, 'approve']);
    Route::post('product-returns/{return}/reject', [ProductReturnController::class, 'reject']);

    // Purchase & Returns routes
    Route::apiResource('purchase-invoices', PurchaseInvoiceController::class);
    Route::get('purchase-invoices/{id}/items-for-return', [PurchaseInvoiceController::class, 'getItemsForReturn']);
    Route::apiResource('returns', ReturnController::class);
    Route::get('returns/invoice/{invoiceId}/available-items', [ReturnController::class, 'getAvailableItems']);
    Route::post('returns/{id}/update-status', [ReturnController::class, 'updateStatus']);

    // People routes
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('suppliers', SupplierController::class);

    // Debts routes
    Route::apiResource('debts', DebtController::class);
    Route::post('debts/{debt}/payment', [DebtController::class, 'recordPayment']);
    Route::get('/customer-debts-summary', [DebtController::class, 'getDebtsSummary']);
    Route::post('/debts/pay', [DebtController::class, 'storePayment']);
    Route::get('/customers/{customer}/debts', [CustomerController::class, 'getDebtDetails']);

    // Expenses routes
    Route::apiResource('expenses', ExpenseController::class);

    // Attendance routes
    Route::apiResource('attendances', AttendanceController::class);
    Route::post('attendances/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('attendances/check-out', [AttendanceController::class, 'checkOut']);
    Route::get('attendances/statistics/{userId}', [AttendanceController::class, 'statistics']);

    // Sales Performance routes
    Route::get('sales-performance', [SalesPerformanceController::class, 'index']);
    Route::get('sales-performance/{userId}', [SalesPerformanceController::class, 'show']);

    // Roles & Permissions routes
    Route::get('permissions', [RoleController::class, 'getAllPermissions']);
    Route::apiResource('roles', RoleController::class);
    Route::post('roles/{role}/permissions', [RoleController::class, 'updatePermissions']);

    // Dashboard & Analytics routes
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::prefix('analytics')->group(function () {
        Route::get('sales', [AnalyticsController::class, 'sales']);
        // ... (بقية مسارات التحليلات)
    });

    // Payment Methods routes
    Route::apiResource('payment-methods', PaymentMethodController::class);
    Route::post('payment-methods/{id}/toggle-active', [PaymentMethodController::class, 'toggleActive']);

    // Reports routes
    Route::get('reports/profit', [ReportController::class, 'profitReport']);
    Route::get('reports/sales', [ReportController::class, 'salesReport']);
    Route::get('reports/purchases', [ReportController::class, 'purchasesReport']);
    Route::get('reports/inventory', [ReportController::class, 'inventoryReport']);
    Route::get('reports/cashier-performance', [ReportController::class, 'cashierPerformance']);
    Route::get('reports/product-performance', [ReportController::class, 'productPerformance']);
    Route::get('reports/dashboard', [ReportController::class, 'dashboardMetrics']);
});
