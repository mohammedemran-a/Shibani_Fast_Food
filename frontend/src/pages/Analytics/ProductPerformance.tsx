import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BarChart3, Award, AlertTriangle, Tag, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangeFilter } from '@/components/reports/DateRangeFilter';
import { toast } from 'sonner';

interface GoldenProduct {
  id: number;
  name: string;
  sold: number;
  revenue: number;
  profit: number;
  profitMargin: number;
}

interface StagnantProduct {
  id: number;
  name: string;
  lastSold: string;
  daysStagnant: number;
  quantity: number;
  value: number;
}

const goldenProducts: GoldenProduct[] = [
  { id: 1, name: 'قهوة عربية فاخرة', sold: 450, revenue: 1350, profit: 675, profitMargin: 50 },
  { id: 2, name: 'تمر مجدول ممتاز', sold: 380, revenue: 1900, profit: 855, profitMargin: 45 },
  { id: 3, name: 'زيت زيتون بكر', sold: 220, revenue: 2200, profit: 880, profitMargin: 40 },
  { id: 4, name: 'عسل طبيعي', sold: 180, revenue: 3600, profit: 1440, profitMargin: 40 },
  { id: 5, name: 'شاي أخضر عضوي', sold: 320, revenue: 640, profit: 256, profitMargin: 40 },
];

const stagnantProducts: StagnantProduct[] = [
  { id: 1, name: 'عصير مانجو معلب', lastSold: '2024-11-15', daysStagnant: 45, quantity: 24, value: 120 },
  { id: 2, name: 'بسكويت محشي قديم', lastSold: '2024-11-20', daysStagnant: 40, quantity: 36, value: 72 },
  { id: 3, name: 'مشروب طاقة', lastSold: '2024-11-25', daysStagnant: 35, quantity: 18, value: 90 },
  { id: 4, name: 'شوكولاتة داكنة', lastSold: '2024-12-01', daysStagnant: 30, quantity: 15, value: 75 },
  { id: 5, name: 'رقائق ذرة حارة', lastSold: '2024-12-05', daysStagnant: 25, quantity: 20, value: 60 },
];

const ProductPerformance: React.FC = () => {
  const { t } = useTranslation();

  const handleCreateDiscount = (productName: string) => {
    toast.success(`${t('productPerformance.discountCreated')} ${productName}`);
  };

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
        <DateRangeFilter />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
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
                <p className="text-2xl font-bold text-foreground">5</p>
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
                <p className="text-2xl font-bold text-foreground">$4,106</p>
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
                <p className="text-2xl font-bold text-foreground">$417</p>
                <p className="text-xs text-muted-foreground">{t('productPerformance.stagnantValue')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="golden" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="golden" className="gap-2">
            <Award className="w-4 h-4" />
            {t('productPerformance.goldenProducts')}
          </TabsTrigger>
          <TabsTrigger value="stagnant" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            {t('productPerformance.stagnantProducts')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="golden" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-warning" />
                {t('productPerformance.goldenProductsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('products.name')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('productPerformance.soldQuantity')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('reports.revenue')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('reports.profit')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('productPerformance.profitMargin')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goldenProducts.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-foreground">{product.name}</td>
                        <td className="py-4 px-4 text-center text-muted-foreground">{product.sold}</td>
                        <td className="py-4 px-4 text-center text-primary font-semibold">${product.revenue}</td>
                        <td className="py-4 px-4 text-center text-success font-semibold">${product.profit}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-success/10 text-success">
                            {product.profitMargin}%
                          </span>
                        </td>
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                {t('productPerformance.stagnantProductsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('products.name')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('productPerformance.lastSold')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('productPerformance.daysStagnant')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('products.quantity')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('productPerformance.stockValue')}</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stagnantProducts.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-foreground">{product.name}</td>
                        <td className="py-4 px-4 text-center text-muted-foreground">{product.lastSold}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            product.daysStagnant >= 40 ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                          }`}>
                            {product.daysStagnant} {t('productPerformance.days')}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-muted-foreground">{product.quantity}</td>
                        <td className="py-4 px-4 text-center text-muted-foreground">${product.value}</td>
                        <td className="py-4 px-4 text-center">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-1"
                            onClick={() => handleCreateDiscount(product.name)}
                          >
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