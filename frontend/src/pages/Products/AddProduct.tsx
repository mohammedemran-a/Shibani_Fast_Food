import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductForm from './ProductForm'; // استيراد الفورم المشترك

/**
 * صفحة إضافة منتج جديد.
 * 
 * هذه الصفحة أصبحت الآن "حاوية عرض" بسيطة.
 * وظيفتها الأساسية هي عرض العنوان وزر الرجوع،
 * ثم عرض المكون المشترك <ProductForm /> الذي يحتوي على كل منطق الفورم.
 */
const AddProduct: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isRTL } = useTheme();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. رأس الصفحة (Header) */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <BackIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('products.addProduct')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('products.addProductDesc')}
          </p>
        </div>
      </div>

      {/* 2. عرض مكون الفورم المشترك */}
      {/* 
        لا نحتاج لتمرير أي props هنا لأن ProductForm مصمم
        ليعمل في وضع "الإضافة" بشكل افتراضي.
        لاحقًا في صفحة التعديل، سنمرر له بيانات المنتج.
      */}
      <ProductForm />
    </div>
  );
};

export default AddProduct;
