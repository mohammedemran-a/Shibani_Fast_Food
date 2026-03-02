import React, { useState } from 'react';
import { RestaurantCartItem } from '../../types';
import { useCartStore } from '../../hooks/useCartStore';
import { PlusCircle, MinusCircle, Trash2, MessageSquare } from 'lucide-react';

interface CartItemCardProps {
  item: RestaurantCartItem;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item }) => {
  const { updateQuantity, removeItem, updateNotes } = useCartStore();
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const itemSubtotal = (item.price + (item.selectedModifiers?.reduce((sum, mod) => sum + mod.price, 0) || 0)) * item.quantity;

  return (
    <div className="bg-background p-3 rounded-lg border transition-shadow hover:shadow-md">
      {/* الجزء العلوي: الاسم، السعر، وزر الحذف */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-grow mr-2">
          <p className="font-bold text-base">{item.name}</p>
          <p className="text-sm text-muted-foreground">{itemSubtotal.toFixed(2)} ر.ي</p>
        </div>
        <button onClick={() => removeItem(item.cartItemId)} className="text-destructive hover:text-destructive/80 p-1">
          <Trash2 size={20} />
        </button>
      </div>

      {/* الجزء الأوسط: الإضافات والمكونات المستبعدة */}
      {(item.selectedModifiers && item.selectedModifiers.length > 0) || (item.excludedIngredients && item.excludedIngredients.length > 0) ? (
        <div className="text-xs space-y-1 my-2">
          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
            <p className="text-green-600">+ {item.selectedModifiers.map(m => m.name).join(', ')}</p>
          )}
          {item.excludedIngredients && item.excludedIngredients.length > 0 && (
            <p className="text-red-600">- بدون: {item.excludedIngredients.map(i => i.name).join(', ')}</p>
          )}
        </div>
      ) : null}

      {/* الجزء السفلي: التحكم بالكمية والملاحظات */}
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-3">
          <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="text-primary hover:text-primary/80">
            <PlusCircle size={24} />
          </button>
          <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
          <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="text-muted-foreground hover:text-destructive/80">
            <MinusCircle size={24} />
          </button>
        </div>
        <button onClick={() => setIsEditingNotes(!isEditingNotes)} className={`p-1 rounded-md ${item.notes ? 'text-primary' : 'text-muted-foreground'} hover:bg-muted`}>
          <MessageSquare size={20} />
        </button>
      </div>

      {/* حقل إدخال الملاحظات (يظهر عند الضغط على أيقونة الملاحظات) */}
      {isEditingNotes && (
        <div className="mt-3">
          <input
            type="text"
            placeholder="أضف ملاحظة خاصة لهذا المنتج..."
            className="w-full text-sm p-2 border rounded-md bg-background"
            defaultValue={item.notes}
            onBlur={(e) => {
              updateNotes(item.cartItemId, e.target.value);
              setIsEditingNotes(false);
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

export default CartItemCard;
