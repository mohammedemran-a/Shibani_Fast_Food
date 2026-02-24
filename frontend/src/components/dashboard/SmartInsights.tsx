import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// 1. تعريف واجهة للبيانات القادمة من الـ API
interface InsightData {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
}

// 2. تعريف واجهة للـ Props التي سيستقبلها المكون
interface SmartInsightsProps {
  data: InsightData[];
  isLoading: boolean;
}

// 3. المكون الآن يستقبل `data` و `isLoading` كـ props
const SmartInsights: React.FC<SmartInsightsProps> = ({ data, isLoading }) => {
  const { t } = useTranslation();

  // دالة لربط نوع الرؤية بالأيقونة واللون المناسبين
  const getInsightAppearance = (type: InsightData['type']) => {
    switch (type) {
      case 'success':
        return { icon: Award, styles: 'bg-success/10 border-success/20 text-success' };
      case 'warning':
        return { icon: AlertTriangle, styles: 'bg-warning/10 border-warning/20 text-warning' };
      case 'info':
      default:
        return { icon: CheckCircle, styles: 'bg-primary/10 border-primary/20 text-primary' };
    }
  };

  // دالة لعرض هيكل التحميل
  const renderSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 p-3">
          <Skeleton className="w-5 h-5 rounded-full mt-0.5" />
          <div className="flex-1">
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Lightbulb className="w-5 h-5 text-warning" />
          {t('insights.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          renderSkeleton()
        ) : (
          data.map((insight, index) => {
            const { icon: Icon, styles } = getInsightAppearance(insight.type);
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border ${styles}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    {/* 4. استخدام البيانات الحقيقية القادمة من الـ API */}
                    <p className="font-medium text-sm">{insight.title}</p>
                    <p className="text-xs opacity-80 mt-0.5">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default SmartInsights;
