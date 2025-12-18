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
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ReportController;

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
    Route::post('products/import', [ProductController::class, 'import']);
    Route::post('products/{product}/barcode', [ProductController::class, 'generateBarcode']);

    // Categories routes
    Route::apiResource('categories', CategoryController::class);

    // Brands routes
    Route::apiResource('brands', BrandController::class);

    // Units routes
    Route::apiResource('units', UnitController::class);

    // Currencies routes
    Route::apiResource('currencies', CurrencyController::class);

    // Sales Invoices routes
    Route::apiResource('sales-invoices', SalesInvoiceController::class);
    Route::post('sales-invoices/{invoice}/cancel', [SalesInvoiceController::class, 'cancel']);
    Route::get('sales-invoices/summary/daily', [SalesInvoiceController::class, 'dailySummary']);
    Route::get('sales-invoices/summary/weekly', [SalesInvoiceController::class, 'weeklySummary']);
    Route::get('sales-invoices/summary/monthly', [SalesInvoiceController::class, 'monthlySummary']);

    // Purchase Invoices routes
    Route::apiResource('purchase-invoices', PurchaseInvoiceController::class);
    Route::post('purchase-invoices/{invoice}/cancel', [PurchaseInvoiceController::class, 'cancel']);
    Route::get('purchase-invoices/summary/daily', [PurchaseInvoiceController::class, 'dailySummary']);
    Route::get('purchase-invoices/summary/weekly', [PurchaseInvoiceController::class, 'weeklySummary']);
    Route::get('purchase-invoices/summary/monthly', [PurchaseInvoiceController::class, 'monthlySummary']);

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

    // Product Returns routes
    Route::apiResource('returns', ProductReturnController::class);
    Route::post('returns/{return}/approve', [ProductReturnController::class, 'approve']);
    Route::post('returns/{return}/reject', [ProductReturnController::class, 'reject']);

    // Users routes
    Route::apiResource('users', UserController::class);
    Route::post('users/{user}/deactivate', [UserController::class, 'deactivate']);
    Route::post('users/{user}/activate', [UserController::class, 'activate']);

    // Roles routes
    Route::apiResource('roles', RoleController::class);
    Route::post('roles/{role}/permissions', [RoleController::class, 'updatePermissions']);

    // Reports routes
    Route::get('reports/profit', [ReportController::class, 'profitReport']);
    Route::get('reports/sales', [ReportController::class, 'salesReport']);
    Route::get('reports/purchases', [ReportController::class, 'purchasesReport']);
    Route::get('reports/inventory', [ReportController::class, 'inventoryReport']);
    Route::get('reports/cashier-performance', [ReportController::class, 'cashierPerformance']);
    Route::get('reports/product-performance', [ReportController::class, 'productPerformance']);
    Route::get('reports/dashboard', [ReportController::class, 'dashboardMetrics']);
});
