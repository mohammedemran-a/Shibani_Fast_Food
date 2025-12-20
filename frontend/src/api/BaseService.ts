import { AxiosInstance, AxiosRequestConfig } from 'axios';
import apiClient from './apiClient';
import { toast } from 'sonner';

/**
 * Base Service Class
 * 
 * تطبيق OOP Principles:
 * - Inheritance: جميع Services ترث من هذا الـ class
 * - Encapsulation: تغليف منطق API calls
 * - DRY: تجنب تكرار الكود
 * - Single Responsibility: مسؤول فقط عن API communication
 */
export abstract class BaseService {
  protected client: AxiosInstance;
  protected baseEndpoint: string;

  constructor(baseEndpoint: string) {
    this.client = apiClient;
    this.baseEndpoint = baseEndpoint;
  }

  /**
   * GET request مع معالجة أخطاء شاملة
   */
  protected async get<T>(
    endpoint: string = '',
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const url = endpoint || this.baseEndpoint;
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error, 'فشل في جلب البيانات');
      throw error;
    }
  }

  /**
   * POST request مع معالجة أخطاء شاملة
   */
  protected async post<T>(
    endpoint: string = '',
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const url = endpoint || this.baseEndpoint;
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, 'فشل في إضافة البيانات');
      throw error;
    }
  }

  /**
   * PUT request مع معالجة أخطاء شاملة
   */
  protected async put<T>(
    endpoint: string = '',
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const url = endpoint || this.baseEndpoint;
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, 'فشل في تحديث البيانات');
      throw error;
    }
  }

  /**
   * DELETE request مع معالجة أخطاء شاملة
   */
  protected async delete<T>(
    endpoint: string = '',
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const url = endpoint || this.baseEndpoint;
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error, 'فشل في حذف البيانات');
      throw error;
    }
  }

  /**
   * معالجة الأخطاء بشكل موحد
   * 
   * تطبيق Clean Code:
   * - DRY: دالة واحدة لمعالجة جميع الأخطاء
   * - Single Responsibility: مسؤولة فقط عن معالجة الأخطاء
   */
  protected handleError(error: any, defaultMessage: string): void {
    console.error(`[${this.baseEndpoint}] Error:`, error);

    // استخراج رسالة الخطأ من الـ response
    let errorMessage = defaultMessage;

    if (error.response) {
      // الخطأ من الـ server
      const { status, data } = error.response;

      if (data?.message) {
        errorMessage = data.message;
      } else if (status === 404) {
        errorMessage = 'البيانات المطلوبة غير موجودة';
      } else if (status === 401) {
        errorMessage = 'يجب تسجيل الدخول أولاً';
      } else if (status === 403) {
        errorMessage = 'ليس لديك صلاحية للقيام بهذا الإجراء';
      } else if (status === 422) {
        errorMessage = 'البيانات المدخلة غير صحيحة';
      } else if (status === 500) {
        errorMessage = 'حدث خطأ في الخادم';
      }
    } else if (error.request) {
      // لم يتم استلام رد من الـ server
      errorMessage = 'فشل الاتصال بالخادم';
    }

    // عرض رسالة الخطأ للمستخدم
    toast.error(errorMessage);
  }

  /**
   * بناء URL مع معاملات
   */
  protected buildUrl(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint;

    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return queryString ? `${endpoint}?${queryString}` : endpoint;
  }
}

export default BaseService;
