import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Error Handler Hook
 * 
 * تطبيق Clean Code Principles:
 * - DRY: تجنب تكرار منطق معالجة الأخطاء
 * - Single Responsibility: مسؤول فقط عن معالجة الأخطاء
 * - Reusability: يمكن استخدامه في أي component
 * 
 * الاستخدام:
 * const { error, handleError, clearError } = useErrorHandler();
 * 
 * try {
 *   await someAsyncOperation();
 * } catch (err) {
 *   handleError(err, 'فشل في تنفيذ العملية');
 * }
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<Error | null>(null);

  /**
   * معالجة الخطأ وعرض رسالة للمستخدم
   */
  const handleError = useCallback((
    err: any,
    defaultMessage: string = 'حدث خطأ غير متوقع'
  ) => {
    console.error('Error:', err);

    let errorMessage = defaultMessage;

    // استخراج رسالة الخطأ من الـ response
    if (err.response) {
      const { status, data } = err.response;

      if (data?.message) {
        errorMessage = data.message;
      } else if (status === 404) {
        errorMessage = 'البيانات المطلوبة غير موجودة';
      } else if (status === 401) {
        errorMessage = 'يجب تسجيل الدخول أولاً';
        // يمكن إضافة redirect للـ login هنا
      } else if (status === 403) {
        errorMessage = 'ليس لديك صلاحية للقيام بهذا الإجراء';
      } else if (status === 422) {
        // Validation errors
        if (data?.errors) {
          const firstError = Object.values(data.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0] as string;
          }
        } else {
          errorMessage = 'البيانات المدخلة غير صحيحة';
        }
      } else if (status === 500) {
        errorMessage = 'حدث خطأ في الخادم';
      }
    } else if (err.request) {
      errorMessage = 'فشل الاتصال بالخادم';
    } else if (err.message) {
      errorMessage = err.message;
    }

    // حفظ الخطأ في الـ state
    setError(err);

    // عرض رسالة للمستخدم
    toast.error(errorMessage);

    return errorMessage;
  }, []);

  /**
   * مسح الخطأ
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * معالجة الخطأ بصمت (بدون toast)
   */
  const handleErrorSilently = useCallback((err: any) => {
    console.error('Error (silent):', err);
    setError(err);
  }, []);

  return {
    error,
    handleError,
    handleErrorSilently,
    clearError,
    hasError: error !== null,
  };
};

export default useErrorHandler;
