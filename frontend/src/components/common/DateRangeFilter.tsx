import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DateRangeFilterProps {
  period: string;
  onPeriodChange: (period: string) => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  period,
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">{t('common.filter')}</h3>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="period">{t('reports.dateRange')}</Label>
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger id="period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t('reports.today')}</SelectItem>
              <SelectItem value="week">{t('reports.thisWeek')}</SelectItem>
              <SelectItem value="month">{t('reports.thisMonth')}</SelectItem>
              <SelectItem value="all">{t('common.viewAll')}</SelectItem>
              <SelectItem value="custom">{t('reports.custom')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {period === 'custom' && (
          <>
            <div>
              <Label htmlFor="start-date">{t('reports.from')}</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate || ''}
                onChange={(e) => onStartDateChange?.(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">{t('reports.to')}</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate || ''}
                onChange={(e) => onEndDateChange?.(e.target.value)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
