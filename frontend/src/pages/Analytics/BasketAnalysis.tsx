import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShoppingBasket, ArrowRight, Filter, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangeFilter } from '@/components/reports/DateRangeFilter';

interface BasketPair {
  id: number;
  productA: string;
  productB: string;
  percentage: number;
  count: number;
}

const basketData: BasketPair[] = [
  { id: 1, productA: 'قهوة عربية', productB: 'تمر مجدول', percentage: 65, count: 124 },
  { id: 2, productA: 'شاي أخضر', productB: 'بسكويت شوكولاتة', percentage: 52, count: 98 },
  { id: 3, productA: 'حليب طازج', productB: 'كورن فليكس', percentage: 48, count: 87 },
  { id: 4, productA: 'خبز طازج', productB: 'جبنة بيضاء', percentage: 45, count: 82 },
  { id: 5, productA: 'عصير برتقال', productB: 'كرواسون', percentage: 42, count: 76 },
  { id: 6, productA: 'أرز بسمتي', productB: 'زيت زيتون', percentage: 38, count: 65 },
  { id: 7, productA: 'دجاج مجمد', productB: 'بهارات مشكلة', percentage: 35, count: 58 },
  { id: 8, productA: 'ماء معدني', productB: 'شيبس', percentage: 32, count: 54 },
];

const BasketAnalysis: React.FC = () => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState('percentage');

  const sortedData = [...basketData].sort((a, b) => {
    if (sortBy === 'percentage') return b.percentage - a.percentage;
    return b.count - a.count;
  });

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 50) return 'text-success bg-success/10';
    if (percentage >= 35) return 'text-warning bg-warning/10';
    return 'text-muted-foreground bg-muted';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <ShoppingBasket className="w-8 h-8 text-primary" />
            {t('basketAnalysis.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('basketAnalysis.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <DateRangeFilter />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">8</p>
              <p className="text-sm text-muted-foreground mt-1">{t('basketAnalysis.productPairs')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-success">65%</p>
              <p className="text-sm text-muted-foreground mt-1">{t('basketAnalysis.highestCorrelation')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">644</p>
              <p className="text-sm text-muted-foreground mt-1">{t('basketAnalysis.totalTransactions')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('basketAnalysis.sortBy')}:</span>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">{t('basketAnalysis.byPercentage')}</SelectItem>
                <SelectItem value="count">{t('basketAnalysis.byCount')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Basket Pairs Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('basketAnalysis.pairsList')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('basketAnalysis.ifBuys')}</th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground"></th>
                  <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('basketAnalysis.alsoBuys')}</th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('basketAnalysis.probability')}</th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('basketAnalysis.transactions')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((pair, index) => (
                  <motion.tr
                    key={pair.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium text-foreground">{pair.productA}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <ArrowRight className="w-5 h-5 text-primary mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-foreground">{pair.productB}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPercentageColor(pair.percentage)}`}>
                        {pair.percentage}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-muted-foreground">
                      {pair.count}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasketAnalysis;