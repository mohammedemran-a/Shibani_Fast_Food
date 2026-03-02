import React, { useState, useMemo } from 'react';
import { RestaurantProduct, Modifier, Ingredient } from '../../types';
import { useCartStore } from '../../hooks/useCartStore';
// ✅ الخطوة 1: استيراد toast من مكتبة sonner الصحيحة
import { toast } from 'sonner';

interface ModifiersModalProps {
  product: RestaurantProduct;
  onClose: () => void;
}

const ModifiersModal: React.FC<ModifiersModalProps> = ({ product, onClose }) => {
  const { addItem } = useCartStore();
  const [selectedModifiers, setSelectedModifiers] = useState<Modifier[]>([]);
  const [includedIngredients, setIncludedIngredients] = useState<Ingredient[]>(product.baseIngredients || []);

  const handleModifierToggle = (modifier: Modifier) => {
    setSelectedModifiers(prev =>
      prev.some(m => m.id === modifier.id)
        ? prev.filter(m => m.id !== modifier.id)
        : [...prev, modifier]
    );
  };

  const handleIngredientToggle = (ingredient: Ingredient) => {
    setIncludedIngredients(prev =>
      prev.some(i => i.id === ingredient.id)
        ? prev.filter(i => i.id !== ingredient.id)
        : [...prev, ingredient]
    );
  };

  const totalPrice = useMemo(() => {
    const modifiersPrice = selectedModifiers.reduce((sum, mod) => sum + mod.price, 0);
    return product.price + modifiersPrice;
  }, [product.price, selectedModifiers]);

  const handleAddToCart = () => {
    const excludedIngredients = product.baseIngredients?.filter(
      baseIng => !includedIngredients.some(incIng => incIng.id === baseIng.id)
    ) || [];
    
    // ✅ الخطوة 2: استدعاء addItem وتخزين النتيجة
    const wasAdded = addItem(product, selectedModifiers, excludedIngredients);
    
    // ✅ الخطوة 3: التحقق من النتيجة
    if (wasAdded) {
      // إذا نجحت الإضافة، أغلق النافذة
      onClose();
    } else {
      // إذا فشلت الإضافة، اعرض الإشعار باستخدام sonner وأبقِ النافذة مفتوحة
      toast.error("يرجى تحديد نوع الطلب أولاً.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" dir="rtl">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md m-4 max-h-[90vh] flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">{product.name}</h2>
          <p className="text-sm text-muted-foreground">قم بتخصيص طلبك</p>
        </div>

        <div className="p-4 flex-grow overflow-y-auto">
          {product.baseIngredients && product.baseIngredients.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 border-b pb-1">المكونات</h3>
              {product.baseIngredients.map(ingredient => (
                <label key={ingredient.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer">
                  <span className="font-medium">{ingredient.name}</span>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={includedIngredients.some(i => i.id === ingredient.id)}
                    onChange={() => handleIngredientToggle(ingredient)}
                  />
                </label>
              ))}
            </div>
          )}

          {product.availableModifiers && product.availableModifiers.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 border-b pb-1">الإضافات</h3>
              {product.availableModifiers.map(modifier => (
                <label key={modifier.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer">
                  <div>
                    <span className="font-medium">{modifier.name}</span>
                    {modifier.price > 0 && (
                      <span className="text-sm text-muted-foreground mr-2">(+{modifier.price.toFixed(2)} ر.ي)</span>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selectedModifiers.some(m => m.id === modifier.id)}
                    onChange={() => handleModifierToggle(modifier)}
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">السعر الإجمالي</span>
            <span className="text-2xl font-bold text-primary">{totalPrice.toFixed(2)} ر.ي</span>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={handleAddToCart} className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors">
              إضافة إلى الطلب
            </button>
            <button onClick={onClose} className="w-full text-sm text-muted-foreground hover:text-foreground py-2">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifiersModal;
