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
import Unauthorized from "./pages/Unauthorized";

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
            <Route path="/pos" element={<ProtectedRoute permission="access_pos"><POS /></ProtectedRoute>} />
            
            {/* Products */}
            <Route path="/products" element={<ProtectedRoute permission="view_products"><ProductsList /></ProtectedRoute>} />
            <Route path="/products/add" element={<ProtectedRoute permission="create_products"><AddProduct /></ProtectedRoute>} />
            <Route path="/products/edit/:id" element={<ProtectedRoute permission="edit_products"><EditProduct /></ProtectedRoute>} />
            <Route path="/products/import" element={<ProtectedRoute permission="import_products"><ImportProducts /></ProtectedRoute>} />
            
            {/* Sales & Purchases */}
            <Route path="/sales" element={<ProtectedRoute permission="view_sales"><Sales /></ProtectedRoute>} />
            <Route path="/purchases" element={<ProtectedRoute permission="view_purchases"><Purchases /></ProtectedRoute>} />
            <Route path="/purchases/add" element={<ProtectedRoute permission="create_purchases"><AddPurchase /></ProtectedRoute>} />
            <Route path="/returns" element={<ProtectedRoute permission="view_returns"><Returns /></ProtectedRoute>} />
            
            {/* Debts */}
            <Route path="/debts" element={<ProtectedRoute permission="view_debts"><DebtManagement /></ProtectedRoute>} />
            <Route path="/debts/:id" element={<ProtectedRoute permission="view_debts"><CustomerDebtDetails /></ProtectedRoute>} />
            
            {/* Analytics */}
            <Route path="/analytics/basket" element={<ProtectedRoute permission="view_analytics"><BasketAnalysis /></ProtectedRoute>} />
            <Route path="/analytics/products" element={<ProtectedRoute permission="view_analytics"><ProductPerformance /></ProtectedRoute>} />
            
            {/* Reports */}
            <Route path="/reports/profit" element={<ProtectedRoute permission="view_profit_report"><ProfitReport /></ProtectedRoute>} />
            <Route path="/reports/sales" element={<ProtectedRoute permission="view_reports"><SalesSummary /></ProtectedRoute>} />
            <Route path="/reports/purchases" element={<ProtectedRoute permission="view_reports"><PurchasesReport /></ProtectedRoute>} />
            <Route path="/reports/summary" element={<ProtectedRoute permission="view_reports"><SalesSummary /></ProtectedRoute>} />
            
            {/* People */}
            <Route path="/people/customers" element={<ProtectedRoute permission="view_customers"><Customers /></ProtectedRoute>} />
            <Route path="/people/customers/:id" element={<ProtectedRoute permission="view_customers"><CustomerDetails /></ProtectedRoute>} />
            <Route path="/people/suppliers" element={<ProtectedRoute permission="view_suppliers"><Suppliers /></ProtectedRoute>} />
            <Route path="/people/users" element={<ProtectedRoute permission="view_users"><Users /></ProtectedRoute>} />
            
            {/* Expenses */}
            <Route path="/expenses" element={<ProtectedRoute permission="view_expenses"><ExpenseManagement /></ProtectedRoute>} />
            
            {/* Employees */}
            <Route path="/employees/attendance" element={<ProtectedRoute permission="view_attendance"><AttendanceTracking /></ProtectedRoute>} />
            <Route path="/employees/performance" element={<ProtectedRoute permission="view_sales_performance"><SalesPerformanceReport /></ProtectedRoute>} />
            
            {/* Settings */}
            <Route path="/settings/general" element={<ProtectedRoute permission="edit_settings"><GeneralSettings /></ProtectedRoute>} />
            <Route path="/settings/units" element={<ProtectedRoute permission="manage_units"><Units /></ProtectedRoute>} />
            <Route path="/settings/currencies" element={<ProtectedRoute permission="manage_currencies"><Currencies /></ProtectedRoute>} />
            <Route path="/settings/categories" element={<ProtectedRoute permission="manage_categories"><Categories /></ProtectedRoute>} />
            <Route path="/settings/brands" element={<ProtectedRoute permission="manage_brands"><Brands /></ProtectedRoute>} />
            <Route path="/settings/roles" element={<ProtectedRoute permission="view_roles"><RolesPermissions /></ProtectedRoute>} />
            <Route path="/settings/wallets" element={<ProtectedRoute permission="manage_wallet_settings"><WalletSettings /></ProtectedRoute>} />
            <Route path="/settings/loyalty" element={<ProtectedRoute permission="manage_loyalty_settings"><LoyaltySettings /></ProtectedRoute>} />
            <Route path="/settings/profile" element={<ProfileSettings />} />
          </Route>
          <Route path="/unauthorized" element={<Unauthorized />} />
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
