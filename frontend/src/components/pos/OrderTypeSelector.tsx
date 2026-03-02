import React from 'react';
import { useCartStore } from '../../hooks/useCartStore';
import { OrderType } from '../../types';
// ✅✅✅ استخدام أيقونات أساسية ومضمونة الوجود ✅✅✅
import { ShoppingBag, Truck, Utensils, AppWindow } from 'lucide-react';

// تعريف أنواع الطلبات مع أيقونات مضمونة
const orderTypesConfig = [
  { type: OrderType.Takeaway, label: 'سفري', icon: <ShoppingBag size={24} /> },
  { type: OrderType.Delivery, label: 'توصيل', icon: <Truck size={24} /> }, // Moped -> Truck
  { type: OrderType.DineIn, label: 'محلي', icon: <Utensils size={24} />, disabled: true }, // UtensilsCrossed -> Utensils
  { type: OrderType.Apps, label: 'تطبيقات', icon: <AppWindow size={24} /> },
];

const OrderTypeSelector: React.FC = () => {
  const { setOrderType } = useCartStore();

  return (
    <div className="bg-card rounded-lg shadow-lg h-full flex flex-col items-center justify-center p-6 text-center">
      <h3 className="text-xl font-bold mb-2 text-foreground">ابدأ طلبًا جديدًا</h3>
      <p className="text-muted-foreground mb-6">يرجى تحديد نوع الطلب أولاً.</p>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {orderTypesConfig.map(({ type, label, icon, disabled }) => (
          <button
            key={type}
            onClick={() => !disabled && setOrderType(type)}
            disabled={disabled}
            className={`
              flex flex-col items-center justify-center p-4 rounded-lg border-2 
              transition-all duration-200 ease-in-out
              ${disabled 
                ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' 
                : 'bg-background hover:border-primary hover:bg-primary/5 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card'
              }
            `}
          >
            {icon}
            <span className="mt-2 font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrderTypeSelector;
