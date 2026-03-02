import { create } from 'zustand';
import { RestaurantCartItem, RestaurantProduct, Modifier, Ingredient, OrderType, DiscountType } from '../types';
import { v4 as uuidv4 } from 'uuid';

// ✅ الخطوة 1: تعريف نوع بسيط وواضح لبيانات السلة فقط
export interface CartData {
  items: RestaurantCartItem[];
  orderType: OrderType | null;
  discountType: DiscountType;
  discountValue: number;
}

// ✅ الخطوة 2: تعريف الواجهة الكاملة التي تتضمن البيانات والدوال
export interface CartState extends CartData {
  setOrderType: (type: OrderType) => void;
  addItem: (product: RestaurantProduct, selectedModifiers: Modifier[], excludedIngredients: Ingredient[]) => boolean;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateNotes: (cartItemId: string, notes: string) => void;
  applyDiscount: (type: DiscountType, value: number) => void;
  clearCart: () => void;
  // ✅✅✅ الخطوة 3: تصحيح تعريف الدالة لتتوقع 'CartData' فقط ✅✅✅
  loadCartState: (state: CartData) => void;
}

const initialState: CartData = {
  items: [],
  orderType: null,
  discountType: DiscountType.None,
  discountValue: 0,
};

export const useCartStore = create<CartState>((set, get) => ({
  ...initialState,

  setOrderType: (type) => set({ orderType: type }),

  addItem: (product, selectedModifiers, excludedIngredients) => {
    if (!get().orderType) {
      return false;
    }
    const newItem: RestaurantCartItem = {
      ...product,
      cartItemId: uuidv4(),
      quantity: 1,
      selectedModifiers: selectedModifiers || [],
      excludedIngredients: excludedIngredients || [],
      notes: '',
    };
    set((state) => ({ items: [...state.items, newItem] }));
    return true;
  },

  removeItem: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.cartItemId !== cartItemId),
    }));
  },

  updateQuantity: (cartItemId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter(i => i.cartItemId !== cartItemId) };
      }
      return {
        items: state.items.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity } : item
        ),
      };
    });
  },

  updateNotes: (cartItemId, notes) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.cartItemId === cartItemId ? { ...item, notes } : item
      ),
    }));
  },

  applyDiscount: (type, value) => {
    set({ discountType: type, discountValue: Math.max(0, value) });
  },

  clearCart: () => set({ ...initialState }),

  // ✅ الخطوة 4: الآن الدالة تتوقع النوع الصحيح
  loadCartState: (newState) => {
    set(newState);
  },
}));
