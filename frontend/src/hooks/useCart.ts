// src/hooks/useCart.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { CartItem, PosProduct, SellableUnit } from '@/types';

// واجهة حالة السلة
interface CartState {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  addToCart: (product: PosProduct) => void;
  removeFromCart: (barcodeId: number) => void;
  updateQuantity: (barcodeId: number, quantity: number) => void;
  changeUnit: (oldBarcodeId: number, newUnit: SellableUnit) => void;
  clearCart: () => void;
}

// دالة مساعدة لحساب الإجماليات
const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.selling_price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, totalItems };
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      totalItems: 0,

      // ✅ =================================================
      // ✅ التصحيح الجذري والنهائي لدالة addToCart
      // ✅ =================================================
      addToCart: (product) => {
        // 1. التحقق من وجود وحدات قابلة للبيع
        if (!product.sellable_units || product.sellable_units.length === 0) {
          toast.error('هذا المنتج لا يحتوي على وحدات قابلة للبيع.');
          return;
        }

        // 2. الحصول على الوحدة الأساسية (أو أول وحدة متاحة)
        const baseUnit = product.sellable_units[0];

        // 3. التحقق مما إذا كانت هذه الوحدة موجودة بالفعل في السلة
        const existingItem = get().items.find(item => item.barcode_id === baseUnit.barcode_id);

        if (existingItem) {
          // إذا كانت موجودة، قم بزيادة الكمية فقط
          get().updateQuantity(existingItem.barcode_id, existingItem.quantity + 1);
        } else {
          // إذا لم تكن موجودة، قم بإنشاء عنصر سلة جديد بالبيانات الصحيحة
          const newItem: CartItem = {
            product_id: product.id, // ✅ من المستوى الأعلى
            product_name: product.name, // ✅ من المستوى الأعلى
            barcode_id: baseUnit.barcode_id,
            unit_name: baseUnit.unit_name,
            selling_price: baseUnit.selling_price,
            quantity: 1,
            image_url: product.image_url,
          };

          set(state => {
            const newItems = [...state.items, newItem];
            const { subtotal, totalItems } = calculateTotals(newItems);
            return { items: newItems, subtotal, totalItems };
          });
          toast.success(`تمت إضافة "${product.name}" إلى السلة.`);
        }
      },

      removeFromCart: (barcodeId) => {
        set(state => {
          const newItems = state.items.filter(item => item.barcode_id !== barcodeId);
          const { subtotal, totalItems } = calculateTotals(newItems);
          return { items: newItems, subtotal, totalItems };
        });
      },

      updateQuantity: (barcodeId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(barcodeId);
          return;
        }
        set(state => {
          const newItems = state.items.map(item =>
            item.barcode_id === barcodeId ? { ...item, quantity } : item
          );
          const { subtotal, totalItems } = calculateTotals(newItems);
          return { items: newItems, subtotal, totalItems };
        });
      },

      changeUnit: (oldBarcodeId, newUnit) => {
        set(state => {
          const newItems = state.items.map(item => {
            if (item.barcode_id === oldBarcodeId) {
              // قم بتحديث العنصر بالوحدة الجديدة مع الحفاظ على الكمية
              return {
                ...item,
                barcode_id: newUnit.barcode_id,
                unit_name: newUnit.unit_name,
                selling_price: newUnit.selling_price,
              };
            }
            return item;
          });
          const { subtotal, totalItems } = calculateTotals(newItems);
          return { items: newItems, subtotal, totalItems };
        });
      },

      clearCart: () => {
        set({ items: [], subtotal: 0, totalItems: 0 });
      },
    }),
    {
      name: 'pos-cart-storage', // اسم مفتاح التخزين في localStorage
    }
  )
);
