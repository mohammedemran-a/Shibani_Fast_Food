import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  variant?: 'primary' | 'accent' | 'success' | 'warning';
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
}) => {
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
