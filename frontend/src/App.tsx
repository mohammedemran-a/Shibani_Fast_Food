import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MainLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import { GeneralSettings, Units, Categories, Brands, Currencies, RolesPermissions, WalletSettings, LoyaltySettings } from "@/pages/Settings";
import { DebtManagement, CustomerDebtDetails } from "@/pages/Debts";
import { BasketAnalysis, ProductPerformance } from "@/pages/Analytics";
import { AttendanceTracking, SalesPerformanceReport } from "@/pages/Employees";
import { ExpenseManagement } from "@/pages/Expenses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/products" element={<ProductsList />} />
              <Route path="/products/add" element={<AddProduct />} />
              <Route path="/products/edit/:id" element={<EditProduct />} />
              <Route path="/products/import" element={<ImportProducts />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/purchases/add" element={<AddPurchase />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/debts" element={<DebtManagement />} />
              <Route path="/debts/:id" element={<CustomerDebtDetails />} />
              <Route path="/analytics/basket" element={<BasketAnalysis />} />
              <Route path="/analytics/products" element={<ProductPerformance />} />
              <Route path="/reports/profit" element={<ProfitReport />} />
              <Route path="/reports/sales" element={<SalesSummary />} />
              <Route path="/reports/purchases" element={<PurchasesReport />} />
              <Route path="/reports/sales-summary" element={<SalesSummary />} />
              <Route path="/reports/purchases-summary" element={<PurchasesSummary />} />
              <Route path="/reports/summary" element={<SalesSummary />} />
              <Route path="/people/customers" element={<Customers />} />
              <Route path="/people/customers/:id" element={<CustomerDetails />} />
              <Route path="/people/suppliers" element={<Suppliers />} />
              <Route path="/people/users" element={<Users />} />
              <Route path="/expenses" element={<ExpenseManagement />} />
              <Route path="/employees/attendance" element={<AttendanceTracking />} />
              <Route path="/employees/performance" element={<SalesPerformanceReport />} />
              <Route path="/settings/general" element={<GeneralSettings />} />
              <Route path="/settings/units" element={<Units />} />
              <Route path="/settings/currencies" element={<Currencies />} />
              <Route path="/settings/categories" element={<Categories />} />
              <Route path="/settings/brands" element={<Brands />} />
              <Route path="/settings/roles" element={<RolesPermissions />} />
              <Route path="/settings/wallets" element={<WalletSettings />} />
              <Route path="/settings/loyalty" element={<LoyaltySettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;