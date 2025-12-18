import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const topProducts = [
  { id: 1, name: 'قهوة عربية', sales: 150, revenue: 450, progress: 95 },
  { id: 2, name: 'شاي أخضر', sales: 120, revenue: 240, progress: 80 },
  { id: 3, name: 'عصير برتقال', sales: 100, revenue: 350, progress: 65 },
  { id: 4, name: 'ماء معدني', sales: 90, revenue: 90, progress: 55 },
  { id: 5, name: 'بسكويت شوكولاتة', sales: 85, revenue: 170, progress: 50 },
];

export const TopProductsList: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="glass-card p-5"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {t('dashboard.topProducts')}
      </h3>
      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <motion.div
            key={product.id}
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
                <p className="font-medium text-foreground truncate">{product.name}</p>
                <div className="flex items-center gap-1 text-success">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-sm font-medium">{product.sales}</span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${product.progress}%` }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="h-full gradient-primary rounded-full"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
