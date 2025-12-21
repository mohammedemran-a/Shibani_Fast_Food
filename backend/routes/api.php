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

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Products routes
    Route::apiResource('products', ProductController::class);
    Route::post('products/import', [ImportController::class, 'importProducts']);
    Route::post('products/{product}/barcode', [ProductController::class, 'generateBarcode']);

    // Categories routes
    Route::apiResource('categories', CategoryController::class);

    // Brands routes
    Route::apiResource('brands', BrandController::class);

    // Units routes
    Route::apiResource('units', UnitController::class);

    // Currencies routes
    Route::apiResource('currencies', CurrencyController::class);

    // Settings routes
    Route::get('settings', [SettingsController::class, 'index']);
    Route::post('settings', [SettingsController::class, 'update']);
    Route::post('settings/logo', [SettingsController::class, 'uploadLogo']);
    Route::get('settings/{key}', [SettingsController::class, 'getSetting']);

    // Sales Invoices routes
    Route::apiResource('sales-invoices', SalesInvoiceController::class);
    Route::post('sales-invoices/{invoice}/cancel', [SalesInvoiceController::class, 'cancel']);
    Route::get('sales-invoices/summary/daily', [SalesInvoiceController::class, 'dailySummary']);
    Route::get('sales-invoices/summary/weekly', [SalesInvoiceController::class, 'weeklySummary']);
    Route::get('sales-invoices/summary/monthly', [SalesInvoiceController::class, 'monthlySummary']);

    // Purchase Invoices routes
    Route::apiResource('purchase-invoices', PurchaseInvoiceController::class);
    Route::get('purchase-invoices/{id}/items-for-return', [PurchaseInvoiceController::class, 'getItemsForReturn']);
    
    // Purchase Returns routes
    Route::apiResource('returns', ReturnController::class);
    Route::get('returns/invoice/{invoiceId}/available-items', [ReturnController::class, 'getAvailableItems']);
    Route::post('returns/{id}/update-status', [ReturnController::class, 'updateStatus']);

    // Customers routes
    Route::apiResource('customers', CustomerController::class);

    // Suppliers routes
    Route::apiResource('suppliers', SupplierController::class);

    // Debts routes
    Route::apiResource('debts', DebtController::class);
    Route::post('debts/{debt}/payment', [DebtController::class, 'recordPayment']);
    Route::get('debts/summary/pending', [DebtController::class, 'pendingSummary']);

    // Expenses routes
    Route::apiResource('expenses', ExpenseController::class);
    Route::get('expenses/summary/daily', [ExpenseController::class, 'dailySummary']);
    Route::get('expenses/summary/weekly', [ExpenseController::class, 'weeklySummary']);
    Route::get('expenses/summary/monthly', [ExpenseController::class, 'monthlySummary']);

    // Product Returns routes (Sales Returns)
    Route::apiResource('product-returns', ProductReturnController::class);
    Route::post('product-returns/{return}/approve', [ProductReturnController::class, 'approve']);
    Route::post('product-returns/{return}/reject', [ProductReturnController::class, 'reject']);

    // Users routes
    Route::apiResource('users', UserController::class);
    Route::post('users/{id}/toggle-active', [UserController::class, 'toggleActive']);

    // Attendance routes
    Route::apiResource('attendances', AttendanceController::class);
    Route::post('attendances/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('attendances/check-out', [AttendanceController::class, 'checkOut']);
    Route::get('attendances/statistics/{userId}', [AttendanceController::class, 'statistics']);

    // Sales Performance routes
    Route::get('sales-performance', [SalesPerformanceController::class, 'index']);
    Route::get('sales-performance/{userId}', [SalesPerformanceController::class, 'show']);
    Route::get('sales-performance/top-performers/list', [SalesPerformanceController::class, 'topPerformers']);
    Route::post('sales-performance/compare', [SalesPerformanceController::class, 'compare']);

    // Roles routes
    Route::apiResource('roles', RoleController::class);
    Route::post('roles/{role}/permissions', [RoleController::class, 'updatePermissions']);

    // Dashboard routes
    Route::get('dashboard', [DashboardController::class, 'index']);

    // Analytics routes
    Route::prefix('analytics')->group(function () {
        Route::get('sales', [AnalyticsController::class, 'sales']);
        Route::get('purchases', [AnalyticsController::class, 'purchases']);
        Route::get('products', [AnalyticsController::class, 'products']);
        Route::get('top-customers', [AnalyticsController::class, 'topCustomers']);
        Route::get('top-suppliers', [AnalyticsController::class, 'topSuppliers']);
        Route::get('product-movement/{productId}', [AnalyticsController::class, 'productMovement']);
        Route::post('clear-cache', [AnalyticsController::class, 'clearCache']);
        Route::post('refresh-cache', [AnalyticsController::class, 'refreshCache']);
    });

    // Payment Methods routes
    Route::apiResource('payment-methods', PaymentMethodController::class);
    Route::post('payment-methods/{id}/toggle-active', [PaymentMethodController::class, 'toggleActive']);
    Route::get('payment-methods-active', [PaymentMethodController::class, 'active']);

    // Reports routes
    Route::get('reports/profit', [ReportController::class, 'profitReport']);
    Route::get('reports/sales', [ReportController::class, 'salesReport']);
    Route::get('reports/purchases', [ReportController::class, 'purchasesReport']);
    Route::get('reports/inventory', [ReportController::class, 'inventoryReport']);
    Route::get('reports/cashier-performance', [ReportController::class, 'cashierPerformance']);
    Route::get('reports/product-performance', [ReportController::class, 'productPerformance']);
    Route::get('reports/dashboard', [ReportController::class, 'dashboardMetrics']);
});
