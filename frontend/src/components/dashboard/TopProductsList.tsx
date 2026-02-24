import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TrendingUp, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// 1. تعريف واجهة للبيانات القادمة من الـ API
interface TopProductData {
  name: string;
  image: string | null;
  total_quantity_sold: number;
}

// 2. تعريف واجهة للـ Props التي سيستقبلها المكون
interface TopProductsListProps {
  data: TopProductData[];
  isLoading: boolean;
}

// 3. المكون الآن يستقبل `data` و `isLoading` كـ props
export const TopProductsList: React.FC<TopProductsListProps> = ({ data, isLoading }) => {
  const { t } = useTranslation();

  // دالة لعرض هيكل التحميل
  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  // دالة لعرض الحالة الفارغة
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-center">
      <Package className="w-12 h-12 text-muted-foreground mb-4" />
      <p className="font-medium text-foreground">{t('reports.noTopProducts')}</p>
      <p className="text-sm text-muted-foreground">{t('reports.noSalesInDataRange')}</p>
    </div>
  );

  // حساب الحد الأقصى للمبيعات لتحديد نسبة شريط التقدم
  const maxSales = data.length > 0 ? Math.max(...data.map(p => p.total_quantity_sold)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="glass-card p-5 h-full"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {t('dashboard.topProducts')}
      </h3>
      {isLoading ? (
        renderSkeleton()
      ) : !data || data.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-4">
          {data.map((product, index) => {
            // 4. حساب نسبة شريط التقدم بناءً على المنتج الأكثر مبيعًا
            const progress = maxSales > 0 ? (product.total_quantity_sold / maxSales) * 100 : 0;
            
            return (
              <motion.div
                key={product.name + index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-foreground truncate" title={product.name}>{product.name}</p>
                    <div className="flex items-center gap-1 text-success shrink-0">
                      <TrendingUp className="w-3 h-3" />
                      {/* 5. استخدام البيانات الحقيقية `total_quantity_sold` */}
                      <span className="text-sm font-medium">{product.total_quantity_sold}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="h-full gradient-primary rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
