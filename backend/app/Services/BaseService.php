<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * Base Service Class
 * 
 * يوفر وظائف مشتركة لجميع الـ Services
 */
abstract class BaseService
{
    /**
     * Execute a database transaction with error handling.
     *
     * @param callable $callback
     * @return mixed
     * @throws Exception
     */
    protected function executeInTransaction(callable $callback)
    {
        try {
            DB::beginTransaction();
            $result = $callback();
            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            $this->logError($e);
            throw $e;
        }
    }

    /**
     * Log error with context.
     *
     * @param Exception $e
     * @param array $context
     * @return void
     */
    protected function logError(Exception $e, array $context = []): void
    {
        Log::error($e->getMessage(), array_merge([
            'exception' => get_class($e),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
        ], $context));
    }

    /**
     * Get error message in Arabic.
     *
     * @param Exception $e
     * @return string
     */
    protected function getArabicErrorMessage(Exception $e): string
    {
        $errorMessages = [
            'Illuminate\Database\QueryException' => 'حدث خطأ في قاعدة البيانات',
            'Illuminate\Validation\ValidationException' => 'بيانات غير صالحة',
            'Symfony\Component\HttpKernel\Exception\NotFoundHttpException' => 'العنصر المطلوب غير موجود',
            'Illuminate\Auth\AuthenticationException' => 'يجب تسجيل الدخول أولاً',
            'Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException' => 'ليس لديك صلاحية للوصول',
        ];

        $exceptionClass = get_class($e);
        
        return $errorMessages[$exceptionClass] ?? 'حدث خطأ غير متوقع';
    }

    /**
     * Format success response.
     *
     * @param mixed $data
     * @param string $message
     * @return array
     */
    protected function successResponse($data = null, string $message = 'تمت العملية بنجاح'): array
    {
        return [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];
    }

    /**
     * Format error response.
     *
     * @param string $message
     * @param mixed $errors
     * @return array
     */
    protected function errorResponse(string $message, $errors = null): array
    {
        return [
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ];
    }
}
