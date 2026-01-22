// frontend/src/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

/**
 * هوك مخصص لتأخير تحديث قيمة معينة.
 * مفيد جدًا لتجنب إرسال طلبات API مع كل ضغطة زر في حقول البحث.
 * @param value القيمة التي تريد تأخيرها (مثل نص البحث).
 * @param delay مدة التأخير بالمللي ثانية (مثل 500ms).
 * @returns القيمة بعد التأخير.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // الحالة التي ستخزن القيمة المؤخرة
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // إعداد مؤقت (timer) لتحديث القيمة بعد انتهاء مدة التأخير
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // دالة التنظيف: يتم استدعاؤها عند كل تغيير في القيمة أو عند إزالة المكون.
    // تقوم بإلغاء المؤقت القديم لمنع تحديثات غير ضرورية.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // يتم إعادة تشغيل هذا التأثير فقط إذا تغيرت القيمة أو مدة التأخير

  return debouncedValue;
}
