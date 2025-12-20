import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

/**
 * Async Operation Hook
 * 
 * تطبيق Clean Code Principles:
 * - DRY: تجنب تكرار منطق العمليات غير المتزامنة
 * - Single Responsibility: مسؤول فقط عن إدارة حالة العمليات غير المتزامنة
 * - Error Handling: معالجة أخطاء شاملة
 * 
 * الاستخدام:
 * const { execute, loading, error } = useAsyncOperation();
 * 
 * const handleSubmit = async () => {
 *   await execute(
 *     () => productService.createProduct(data),
 *     'تم إضافة المنتج بنجاح',
 *     'فشل في إضافة المنتج'
 *   );
 * };
 */
export const useAsyncOperation = <T = any>() => {
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  /**
   * تنفيذ عملية غير متزامنة مع معالجة الأخطاء
   */
  const execute = useCallback(
    async (
      operation: () => Promise<T>,
      successMessage?: string,
      errorMessage?: string,
      onSuccess?: (result: T) => void
    ): Promise<T | null> => {
      setLoading(true);
      clearError();

      try {
        const result = await operation();

        // عرض رسالة نجاح إذا تم تمريرها
        if (successMessage) {
          const { toast } = await import('sonner');
          toast.success(successMessage);
        }

        // استدعاء callback النجاح إذا تم تمريره
        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        handleError(err, errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError, clearError]
  );

  /**
   * تنفيذ عملية غير متزامنة بصمت (بدون رسائل)
   */
  const executeSilently = useCallback(
    async (operation: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      clearError();

      try {
        const result = await operation();
        return result;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError, clearError]
  );

  return {
    execute,
    executeSilently,
    loading,
    error,
    hasError: error !== null,
    clearError,
  };
};

export default useAsyncOperation;
