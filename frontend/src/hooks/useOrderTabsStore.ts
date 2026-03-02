import {create} from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { RestaurantProduct, Modifier, Ingredient, OrderType, RestaurantCartItem } from '../types';

// واجهات البيانات (لا تغيير)
export interface OrderTabData {
  id: string;
  name: string;
  items: RestaurantCartItem[];
  orderType: OrderType | null;
  discountType: DiscountType;
  discountValue: number;
}

interface OrderTabsState {
  tabs: OrderTabData[];
  activeTabId: string | null;
  addTab: () => void;
  switchTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  setOrderType: (type: OrderType) => void;
  addItem: (product: RestaurantProduct, modifiers: Modifier[], excluded: Ingredient[]) => boolean;
  updateItemQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  updateNotes: (cartItemId: string, notes: string) => void;
  applyDiscount: (type: DiscountType, value: number) => void;
  getActiveTab: () => OrderTabData | null;
  clearActiveCart: () => void;
}

export enum DiscountType {
  None,
  Percentage,
  FixedAmount,
}

const createNewTab = (index: number): OrderTabData => ({
  id: uuidv4(),
  name: `طلب ${index}`,
  items: [],
  orderType: null,
  discountType: DiscountType.None,
  discountValue: 0,
});

export const useOrderTabsStore = create<OrderTabsState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  // دوال إدارة الطلبات (لا تغيير)
  addTab: () => {
    const newIndex = get().tabs.length + 1;
    const newTab = createNewTab(newIndex);
    set(state => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));
  },
  switchTab: (tabId) => {
    if (get().tabs.some(t => t.id === tabId)) {
      set({ activeTabId: tabId });
    }
  },
  closeTab: (tabId) => {
    set(state => {
      const remainingTabs = state.tabs.filter(t => t.id !== tabId);
      let newActiveId = state.activeTabId;
      if (state.activeTabId === tabId) {
        newActiveId = remainingTabs.length > 0 ? remainingTabs[0].id : null;
      }
      return { tabs: remainingTabs, activeTabId: newActiveId };
    });
  },

  // =============================================================
  // ✅✅✅ إعادة كتابة جميع دوال التحديث بشكل مباشر وبسيط ✅✅✅
  // =============================================================

  setOrderType: (type) => {
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId ? { ...tab, orderType: type } : tab
      ),
    }));
  },

  addItem: (product, modifiers, excluded) => {
    const activeTab = get().getActiveTab();
    if (!activeTab || !activeTab.orderType) {
      return false; 
    }
    
    const newItem: RestaurantCartItem = {
      ...product,
      cartItemId: uuidv4(),
      quantity: 1,
      selectedModifiers: modifiers || [],
      excludedIngredients: excluded || [],
      notes: '',
    };

    set(state => ({
      tabs: state.tabs.map(t => 
        t.id === state.activeTabId ? { ...t, items: [...t.items, newItem] } : t
      ),
    }));
    return true;
  },

  updateItemQuantity: (cartItemId, quantity) => {
    set(state => ({
      tabs: state.tabs.map(tab => {
        if (tab.id !== state.activeTabId) return tab;
        
        if (quantity <= 0) {
          return { ...tab, items: tab.items.filter(i => i.cartItemId !== cartItemId) };
        }
        return {
          ...tab,
          items: tab.items.map(i => i.cartItemId === cartItemId ? { ...i, quantity } : i),
        };
      }),
    }));
  },

  removeItem: (cartItemId) => {
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { ...tab, items: tab.items.filter(i => i.cartItemId !== cartItemId) } 
          : tab
      ),
    }));
  },
  
  updateNotes: (cartItemId, notes) => {
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { ...tab, items: tab.items.map(i => i.cartItemId === cartItemId ? { ...i, notes } : i) } 
          : tab
      ),
    }));
  },

  applyDiscount: (type, value) => {
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { ...tab, discountType: type, discountValue: Math.max(0, value) } 
          : tab
      ),
    }));
  },

  clearActiveCart: () => {
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { ...tab, items: [], discountType: DiscountType.None, discountValue: 0, orderType: null } 
          : tab
      ),
    }));
  },

  // دالة مساعدة (لا تغيير)
  getActiveTab: () => {
    const { tabs, activeTabId } = get();
    return tabs.find(t => t.id === activeTabId) || null;
  },
}));
