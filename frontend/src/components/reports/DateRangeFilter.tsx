import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

/**
 * واجهة الخصائص (Props) لمكون فلتر التاريخ.
 * @property {string} value - القيمة الحالية للفلتر (e.g., 'thisMonth', 'custom').
 * @property {(value: string) => void} onValueChange - دالة يتم استدعاؤها عند اختيار قيمة جديدة من القائمة.
 * @property {React.ReactNode} [children] - مكون اختياري يتم عرضه عندما يكون الفلتر "مخصص".
 */
interface DateRangeFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  children?: React.ReactNode;
}

/**
 * مكون DateRangeFilter المتحكم به (Controlled Component).
 * يعرض قائمة منسدلة بخيارات الفلترة الزمنية (اليوم، هذا الشهر، إلخ).
 * ويسمح بعرض مكون مخصص لاختيار نطاق تاريخ محدد.
 */
export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onValueChange, children }) => {
  const { t } = useTranslation();

  // قائمة الخيارات الثابتة للفلتر
  const options = [
    { value: 'all', label: t('filters.allTime') },
    { value: 'today', label: t('reports.today') },
    { value: 'yesterday', label: t('reports.yesterday') },
    { value: 'thisWeek', label: t('reports.thisWeek') },
    { value: 'thisMonth', label: t('reports.thisMonth') },
  ];

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 w-[180px] justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {/* يعرض التسمية المطابقة للقيمة الحالية، أو "مخصص" إذا لم تطابق */}
              <span>{options.find(o => o.value === value)?.label || t('reports.custom')}</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onValueChange(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
          {/* يعرض خيار "مخصص" فقط إذا تم تمرير مكون `children` */}
          {children && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onValueChange('custom')}
                className="font-semibold"
              >
                {t('reports.custom')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* يعرض مكون منتقي التاريخ المخصص فقط إذا كان الفلتر الحالي هو "custom" */}
      {value === 'custom' && children}
    </div>
  );
};
