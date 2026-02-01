import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBasket, ArrowRight, Filter, Loader2, ServerCrash, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangeFilter } from '@/components/reports/DateRangeFilter';
import { useBasketAnalysis } from '@/hooks/useBasketAnalysis';
import { BasketAnalysisQueryOptions } from '@/api/analyticsService';
import { format, subDays, startOfMonth, startOfWeek, startOfDay, endOfDay } from 'date-fns';

// =================================================================
// المكون الرئيسي
// =================================================================
const BasketAnalysis: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<'percentage' | 'pair_count'>('percentage');

  const currentFilter = searchParams.get('filter') || 'all';

  const handleFilterChange = (filterValue: string) => {
    const newParams = new URLSearchParams();
    newParams.set('filter', filterValue);

    const today = new Date();
    let from: Date | undefined;
    let to: Date | undefined = endOfDay(today);

    switch (filterValue) {
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
      case 'all':
      default:
        from = undefined;
        to = undefined;
        break;
    }

    if (from) {
      newParams.set('from', format(from, 'yyyy-MM-dd'));
    } else {
      newParams.delete('from');
    }
    
    if (to) {
      newParams.set('to', format(to, 'yyyy-MM-dd'));
    } else {
      newParams.delete('to');
    }

    setSearchParams(newParams);
  };

  const options: BasketAnalysisQueryOptions = useMemo(() => ({
    startDate: searchParams.get('from') || undefined,
    endDate: searchParams.get('to') || undefined,
    limit: 50,
    minSupport: 1, // تم التعديل في خطوة سابقة لضمان ظهور البيانات
  }), [searchParams]);

  const { data, isLoading, isError, error, isFetching } = useBasketAnalysis(options);

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      if (sortBy === 'percentage') return b.percentage - a.percentage;
      return b.pair_count - a.pair_count;
    });
  }, [data, sortBy]);

  const highestCorrelation = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map(p => p.percentage));
  }, [data]);

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 50) return 'text-success bg-success/10';
    if (percentage >= 25) return 'text-warning bg-warning/10';
    return 'text-muted-foreground bg-muted';
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-destructive/10 rounded-lg p-4">
          <ServerCrash className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-xl font-bold text-destructive">{t('common.errorLoading')}</h3>
          <p className="text-muted-foreground mt-2 text-center">{error?.message}</p>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg p-4">
          <Info className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold text-foreground">{t('common.noData')}</h3>
          <p className="text-muted-foreground mt-2 text-center">لا توجد بيانات كافية لتحليل السلة. قم بإجراء المزيد من المبيعات.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('analytics.ifBuys')}</th>
              <th className="text-center py-4 px-4 font-medium text-muted-foreground"></th>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('analytics.alsoBuys')}</th>
              <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('analytics.probability')}</th>
              <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('performance.totalInvoices')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((pair, index) => (
              <motion.tr
                key={`${pair.productA}-${pair.productB}`}
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
                  {pair.pair_count}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <ShoppingBasket className="w-8 h-8 text-primary" />
            {/* ================================================================= */}
            {/* **1. استخدام المفتاح الصحيح من ملف الترجمة** */}
            {/* ================================================================= */}
            {t('nav.basketAnalysis')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('analytics.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeFilter 
            value={currentFilter}
            onValueChange={handleFilterChange}
          />
          {isFetching && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{isLoading ? '...' : (data?.length || 0)}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('analytics.productPairs')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{isLoading ? '...' : `${highestCorrelation}%`}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('analytics.highestCorrelation')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">...</p>
              <p className="text-sm text-muted-foreground mt-1">{t('performance.totalInvoices')}</p>
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
              <span className="text-sm text-muted-foreground">{t('common.filter')}:</span>
            </div>
            <Select value={sortBy} onValueChange={(value: 'percentage' | 'pair_count') => setSortBy(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">{t('analytics.byPercentage')}</SelectItem>
                  <SelectItem value="pair_count">{t('customers.times')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Basket Pairs Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('analytics.pairsList')}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default BasketAnalysis;
