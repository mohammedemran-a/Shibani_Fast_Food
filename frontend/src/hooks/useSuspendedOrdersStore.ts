import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { useCartStore } from './useCartStore';
import type { OrderType, DiscountType, RestaurantCartItem } from '../types';

// نوع بسيط وواضح لبيانات السلة فقط
interface CartData {
  items: RestaurantCartItem[];
  orderType: OrderType | null;
  discountType: DiscountType;
  discountValue: number;
}

// شكل الطلب المعلق
interface SuspendedOrder {
  id: string;
  name: string;
  suspendedAt: Date;
  cartState: CartData;
}

interface SuspendedOrdersState {
  suspendedOrders: SuspendedOrder[];
  suspendCurrentOrder: () => void;
  resumeOrder: (orderId: string) => void;
}

export const useSuspendedOrdersStore = create<SuspendedOrdersState>((set, get) => ({
  suspendedOrders: [],

  // دالة تعليق الطلب الحالي
  suspendCurrentOrder: () => {
    const currentCartState = useCartStore.getState();

    if (currentCartState.items.length === 0) {
      return;
    }

    const newSuspendedOrder: SuspendedOrder = {
      id: uuidv4(),
      name: `طلب معلق #${get().suspendedOrders.length + 1}`,
      suspendedAt: new Date(),
      cartState: {
        items: currentCartState.items,
        orderType: currentCartState.orderType,
        discountType: currentCartState.discountType,
        discountValue: currentCartState.discountValue,
      },
    };

    set(state => ({
      suspendedOrders: [...state.suspendedOrders, newSuspendedOrder],
    }));

    useCartStore.getState().clearCart();
  },

  // دالة استئناف طلب معلق
  resumeOrder: (orderId: string) => {
    const orderToResume = get().suspendedOrders.find(o => o.id === orderId);
    if (!orderToResume) return;

    const currentCartState = useCartStore.getState();
    if (currentCartState.items.length > 0) {
      console.warn("Cart is not empty. Please suspend or complete the current order before resuming another.");
      // يمكنك إضافة إشعار هنا للمستخدم
      return; 
    }

    useCartStore.getState().loadCartState(orderToResume.cartState);

    set(state => ({
      suspendedOrders: state.suspendedOrders.filter(o => o.id !== orderId),
    }));
  },
}));
