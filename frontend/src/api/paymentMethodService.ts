import { apiClient } from './apiClient';

/**
 * Payment Method Service
 * 
 * خدمة للتعامل مع API طرق الدفع (المحافظ الإلكترونية)
 */

export interface PaymentMethod {
  id: number;
  name: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodData {
  name: string;
  icon?: string;
  is_active?: boolean;
}

class PaymentMethodService {
  private endpoint = '/payment-methods';

  /**
   * جلب جميع طرق الدفع
   */
  async getAll(): Promise<PaymentMethod[]> {
    const response = await apiClient.get(this.endpoint);
    return response.data.data;
  }

  /**
   * جلب طرق الدفع المفعلة فقط
   */
  async getActive(): Promise<PaymentMethod[]> {
    const response = await apiClient.get('/payment-methods-active');
    return response.data.data;
  }

  /**
   * جلب طريقة دفع محددة
   */
  async getById(id: number): Promise<PaymentMethod> {
    const response = await apiClient.get(`${this.endpoint}/${id}`);
    return response.data.data;
  }

  /**
   * إنشاء طريقة دفع جديدة
   */
  async create(data: CreatePaymentMethodData): Promise<PaymentMethod> {
    const response = await apiClient.post(this.endpoint, data);
    return response.data.data;
  }

  /**
   * تحديث طريقة دفع
   */
  async update(id: number, data: Partial<CreatePaymentMethodData>): Promise<PaymentMethod> {
    const response = await apiClient.put(`${this.endpoint}/${id}`, data);
    return response.data.data;
  }

  /**
   * حذف طريقة دفع
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * تفعيل/تعطيل طريقة دفع
   */
  async toggleActive(id: number): Promise<PaymentMethod> {
    const response = await apiClient.post(`${this.endpoint}/${id}/toggle-active`);
    return response.data.data;
  }
}

const paymentMethodService = new PaymentMethodService();

export { paymentMethodService };
export default paymentMethodService;
