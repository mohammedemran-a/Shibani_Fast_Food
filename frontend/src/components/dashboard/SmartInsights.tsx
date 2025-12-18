import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle, Award, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Insight {
  id: number;
  type: 'success' | 'warning' | 'info';
  icon: React.ElementType;
  title: string;
  description: string;
}

const SmartInsights: React.FC = () => {
  const { t } = useTranslation();

  const insights: Insight[] = [
    {
      id: 1,
      type: 'success',
      icon: Award,
      title: t('insights.topSelling'),
      description: t('insights.topSellingDesc'),
    },
    {
      id: 2,
      type: 'warning',
      icon: AlertTriangle,
      title: t('insights.lowStock'),
      description: t('insights.lowStockDesc'),
    },
    {
      id: 3,
      type: 'info',
      icon: TrendingUp,
      title: t('insights.salesTrend'),
      description: t('insights.salesTrendDesc'),
    },
    {
      id: 4,
      type: 'info',
      icon: Clock,
      title: t('insights.peakHours'),
      description: t('insights.peakHoursDesc'),
    },
  ];

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/20 text-success';
      case 'warning':
        return 'bg-warning/10 border-warning/20 text-warning';
      default:
        return 'bg-primary/10 border-primary/20 text-primary';
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Lightbulb className="w-5 h-5 text-warning" />
          {t('insights.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg border ${getTypeStyles(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              <insight.icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{insight.title}</p>
                <p className="text-xs opacity-80 mt-0.5">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartInsights;