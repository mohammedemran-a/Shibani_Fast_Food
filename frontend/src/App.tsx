import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAppSettings } from "@/hooks/useAppSettings";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/i18n";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import POS from "@/pages/POS";
import { ProductsList, AddProduct, ImportProducts, EditProduct } from "@/pages/Products";
import Sales from "@/pages/Sales";
import Returns from "@/pages/Returns";
import { ProfitReport, PurchasesReport, SalesSummary, PurchasesSummary } from "@/pages/Reports";
import { Purchases, AddPurchase } from "@/pages/Purchases";
import { Customers, CustomerDetails, Suppliers, Users } from "@/pages/People";
import { GeneralSettings, Units, Categories, Brands, Currencies, RolesPermissions, WalletSettings, LoyaltySettings, ProfileSettings } from "@/pages/Settings";
import { DebtManagement, CustomerDebtDetails } from "@/pages/Debts";
import { BasketAnalysis, ProductPerformance } from "@/pages/Analytics";
import { AttendanceTracking, SalesPerformanceReport } from "@/pages/Employees";
import { ExpenseManagement } from "@/pages/Expenses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  // تحديث عنوان الصفحة والأيقونة تلقائياً
  useAppSettings();

  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* POS */}
            <Route path="/pos" element={<ProtectedRoute permission="pos_access"><POS /></ProtectedRoute>} />
            
            {/* Products */}
            <Route path="/products" element={<ProtectedRoute permission="products_view"><ProductsList /></ProtectedRoute>} />
            <Route path="/products/add" element={<ProtectedRoute permission="products_add"><AddProduct /></ProtectedRoute>} />
            <Route path="/products/edit/:id" element={<ProtectedRoute permission="products_edit"><EditProduct /></ProtectedRoute>} />
            <Route path="/products/import" element={<ProtectedRoute permission="products_add"><ImportProducts /></ProtectedRoute>} />
            
            {/* Sales & Purchases */}
            <Route path="/sales" element={<ProtectedRoute permission="sales_view"><Sales /></ProtectedRoute>} />
            <Route path="/purchases" element={<ProtectedRoute permission="purchases_view"><Purchases /></ProtectedRoute>} />
            <Route path="/purchases/add" element={<ProtectedRoute permission="purchases_add"><AddPurchase /></ProtectedRoute>} />
            <Route path="/returns" element={<ProtectedRoute permission="returns_view"><Returns /></ProtectedRoute>} />
            
            {/* Debts */}
            <Route path="/debts" element={<ProtectedRoute permission="debts_view"><DebtManagement /></ProtectedRoute>} />
            <Route path="/debts/:id" element={<ProtectedRoute permission="debts_view"><CustomerDebtDetails /></ProtectedRoute>} />
            
            {/* Analytics */}
            <Route path="/analytics/basket" element={<ProtectedRoute permission="analytics_view"><BasketAnalysis /></ProtectedRoute>} />
            <Route path="/analytics/products" element={<ProtectedRoute permission="analytics_view"><ProductPerformance /></ProtectedRoute>} />
            
            {/* Reports */}
            <Route path="/reports/profit" element={<ProtectedRoute permission="reports_view"><ProfitReport /></ProtectedRoute>} />
            <Route path="/reports/sales" element={<ProtectedRoute permission="reports_view"><SalesSummary /></ProtectedRoute>} />
            <Route path="/reports/purchases" element={<ProtectedRoute permission="reports_view"><PurchasesReport /></ProtectedRoute>} />
            <Route path="/reports/summary" element={<ProtectedRoute permission="reports_view"><SalesSummary /></ProtectedRoute>} />
            
            {/* People */}
            <Route path="/people/customers" element={<ProtectedRoute permission="customers_view"><Customers /></ProtectedRoute>} />
            <Route path="/people/customers/:id" element={<ProtectedRoute permission="customers_view"><CustomerDetails /></ProtectedRoute>} />
            <Route path="/people/suppliers" element={<ProtectedRoute permission="suppliers_view"><Suppliers /></ProtectedRoute>} />
            <Route path="/people/users" element={<ProtectedRoute permission="users_view"><Users /></ProtectedRoute>} />
            
            {/* Expenses */}
            <Route path="/expenses" element={<ProtectedRoute permission="expenses_view"><ExpenseManagement /></ProtectedRoute>} />
            
            {/* Employees */}
            <Route path="/employees/attendance" element={<ProtectedRoute permission="attendance_view"><AttendanceTracking /></ProtectedRoute>} />
            <Route path="/employees/performance" element={<ProtectedRoute permission="sales_performance_view"><SalesPerformanceReport /></ProtectedRoute>} />
            
            {/* Settings */}
            <Route path="/settings/general" element={<ProtectedRoute permission="settings_manage"><GeneralSettings /></ProtectedRoute>} />
            <Route path="/settings/units" element={<ProtectedRoute permission="settings_manage"><Units /></ProtectedRoute>} />
            <Route path="/settings/currencies" element={<ProtectedRoute permission="settings_manage"><Currencies /></ProtectedRoute>} />
            <Route path="/settings/categories" element={<ProtectedRoute permission="settings_manage"><Categories /></ProtectedRoute>} />
            <Route path="/settings/brands" element={<ProtectedRoute permission="settings_manage"><Brands /></ProtectedRoute>} />
            <Route path="/settings/roles" element={<ProtectedRoute permission="roles_manage"><RolesPermissions /></ProtectedRoute>} />
            <Route path="/settings/wallets" element={<ProtectedRoute permission="settings_manage"><WalletSettings /></ProtectedRoute>} />
            <Route path="/settings/loyalty" element={<ProtectedRoute permission="settings_manage"><LoyaltySettings /></ProtectedRoute>} />
            <Route path="/settings/profile" element={<ProfileSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>

      </TooltipProvider>
    </ThemeProvider>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
