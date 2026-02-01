import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BarChart3, Award, AlertTriangle, Tag, TrendingUp, TrendingDown, Loader2, ServerCrash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangeFilter } from '@/components/reports/DateRangeFilter';
import { toast } from 'sonner';
import { useProductPerformance } from '@/hooks/useProductPerformance';
import { AnalyticsQueryOptions, PerformanceProduct } from '@/api/analyticsService';
import { format, subDays, startOfMonth, startOfWeek, startOfDay, endOfDay } from 'date-fns';

const formatCurrency = (amount: number | undefined | null) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const ProductPerformance: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // القيمة الافتراضية للفلتر هي "كل الوقت"
  const currentFilter = searchParams.get('filter') || 'all';

  /**
   * دالة لمعالجة تغيير الفلتر السريع (اليوم، هذا الأسبوع، إلخ).
   * تقوم بحساب التواريخ المقابلة وتحديث الـ URL.
   * @param {string} filterValue - القيمة الجديدة للفلتر.
   */
  const handleFilterChange = (filterValue: string) => {
    const newParams = new URLSearchParams();
    newParams.set('filter', filterValue);

    const today = new Date();
    let from: Date | undefined;
    let to: Date | undefined = endOfDay(today);

    switch (filterValue) {
      case 'all':
        from = undefined;
        to = undefined;
        break;
      case 'today':
        from = startOfDay(today);
        break;
      case 'yesterday':
        from = startOfDay(subDays(today, 1));
        to = endOfDay(subDays(today, 1));
        break;
      case 'thisWeek':
        from = startOfWeek(today);
        break;
      case 'thisMonth':
        from = startOfMonth(today);
        break;
      default:
        from = undefined;
        to = undefined;
        newParams.set('filter', 'all');
        break;
    }

    if (filterValue === 'all') {
      newParams.delete('from');
      newParams.delete('to');
    } else {
      if (from) newParams.set('from', format(from, 'yyyy-MM-dd'));
      if (to) newParams.set('to', format(to, 'yyyy-MM-dd'));
    }

    setSearchParams(newParams);
  };

  const options: AnalyticsQueryOptions = useMemo(() => ({
    startDate: searchParams.get('from') || undefined,
    endDate: searchParams.get('to') || undefined,
    limit: 10,
  }), [searchParams]);

  const { data, isLoading, isError, error, isFetching } = useProductPerformance(options);

  const handleCreateDiscount = (productName: string) => {
    toast.success(`${t('productPerformance.discountCreated')} ${productName}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-destructive/10 rounded-lg">
        <ServerCrash className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive">{t('errors.fetchErrorTitle')}</h2>
        <p className="text-muted-foreground mt-2">{error?.message || t('errors.fetchErrorSubtitle')}</p>
      </div>
    );
  }
  
  const totalProfit = data?.most_profitable.reduce((sum, p) => sum + (p.total_profit || 0), 0);
  const stagnantProducts = data?.top_selling_by_quantity.slice(-5).reverse() || [];
  const stagnantValue = stagnantProducts.reduce((sum, p) => {
      const purchasePrice = (p.total_revenue / p.total_quantity) - ((p.total_profit || 0) / p.total_quantity);
      return sum + ((p.current_stock || 0) * (isNaN(purchasePrice) ? 0 : purchasePrice));
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            {t('productPerformance.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('productPerformance.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeFilter 
            value={currentFilter}
            onValueChange={handleFilterChange}
          /> 
          {isFetching && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{data?.most_profitable.length}</p>
                <p className="text-xs text-muted-foreground">{t('productPerformance.goldenProducts')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stagnantProducts.length}</p>
                <p className="text-xs text-muted-foreground">{t('productPerformance.stagnantProducts')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalProfit)}</p>
                <p className="text-xs text-muted-foreground">{t('productPerformance.totalProfit')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stagnantValue)}</p>
                <p className="text-xs text-muted-foreground">{t('productPerformance.stagnantValue')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="golden" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="golden" className="gap-2"><Award className="w-4 h-4" />{t('productPerformance.goldenProducts')}</TabsTrigger>
          <TabsTrigger value="stagnant" className="gap-2"><AlertTriangle className="w-4 h-4" />{t('productPerformance.stagnantProducts')}</TabsTrigger>
        </TabsList>

        <TabsContent value="golden" className="mt-6">
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-warning" />{t('productPerformance.goldenProductsTitle')}</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('products.name')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('productPerformance.soldQuantity')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('reports.revenue')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('reports.profit')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.most_profitable.map((product: PerformanceProduct, index) => (
                      <motion.tr key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4 font-medium text-foreground">{product.name}</td>
                        <td className="py-4 px-4 text-center text-muted-foreground">{product.total_quantity}</td>
                        <td className="py-4 px-4 text-center text-primary font-semibold">{formatCurrency(product.total_revenue)}</td>
                        <td className="py-4 px-4 text-center text-success font-semibold">{formatCurrency(product.total_profit)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stagnant" className="mt-6">
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" />{t('productPerformance.stagnantProductsTitle')}</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('products.name')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('productPerformance.soldQuantity')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('products.quantity')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stagnantProducts.map((product, index) => (
                      <motion.tr key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4 font-medium text-foreground">{product.name}</td>
                        <td className="py-4 px-4 text-center text-muted-foreground">{product.total_quantity}</td>
                        <td className="py-4 px-4 text-center text-muted-foreground">{product.current_stock}</td>
                        <td className="py-4 px-4 text-center">
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => handleCreateDiscount(product.name)}>
                            <Tag className="w-3 h-3" />
                            {t('productPerformance.quickDiscount')}
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductPerformance;
