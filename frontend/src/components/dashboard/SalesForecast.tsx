import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { TrendingUp } from 'lucide-react';

const forecastData = [
  { name: 'السبت', actual: 2400, forecast: null },
  { name: 'الأحد', actual: 1398, forecast: null },
  { name: 'الاثنين', actual: 3800, forecast: null },
  { name: 'الثلاثاء', actual: 3908, forecast: null },
  { name: 'الأربعاء', actual: 4800, forecast: null },
  { name: 'الخميس', actual: 3800, forecast: null },
  { name: 'الجمعة', actual: 4300, forecast: null },
  { name: 'السبت (توقع)', actual: null, forecast: 4500 },
  { name: 'الأحد (توقع)', actual: null, forecast: 3200 },
  { name: 'الاثنين (توقع)', actual: null, forecast: 4100 },
  { name: 'الثلاثاء (توقع)', actual: null, forecast: 4600 },
];

const SalesForecast: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useTheme();

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <TrendingUp className="w-5 h-5 text-primary" />
          {t('forecast.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t('forecast.subtitle')}</p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                reversed={isRTL}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                orientation={isRTL ? 'right' : 'left'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorActual)"
                name={t('forecast.actualSales')}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'hsl(var(--warning))', r: 4 }}
                name={t('forecast.expectedSales')}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-xs text-muted-foreground">{t('forecast.actualSales')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-warning" style={{ borderBottom: '2px dashed' }}></div>
            <span className="text-xs text-muted-foreground">{t('forecast.expectedSales')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesForecast;