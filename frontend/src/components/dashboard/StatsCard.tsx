import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton'; // 1. استيراد مكون Skeleton

// 2. إضافة `isLoading` إلى الواجهة
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  variant?: 'primary' | 'accent' | 'success' | 'warning';
  isLoading?: boolean; // <-- الخاصية الجديدة
}

const variantStyles = {
  primary: 'gradient-primary',
  accent: 'gradient-accent',
  success: 'gradient-success',
  warning: 'bg-warning',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  variant = 'primary',
  isLoading = false, // <-- القيمة الافتراضية
}) => {
  // 3. عرض نسخة هيكلية من البطاقة في حالة التحميل
  if (isLoading) {
    return (
      <div className="stat-card bg-card p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-8 w-1/2 mb-3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        </div>
      </div>
    );
  }

  // عرض البطاقة الحقيقية في حالة عدم التحميل
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="stat-card bg-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground">{value}</h3>
          {change && (
            <p
              className={cn(
                'text-sm mt-2 font-medium',
                changeType === 'positive' && 'text-success',
                changeType === 'negative' && 'text-destructive',
                changeType === 'neutral' && 'text-muted-foreground'
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            variantStyles[variant]
          )}
        >
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
    </motion.div>
  );
};
