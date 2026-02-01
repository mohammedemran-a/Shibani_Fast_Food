import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import apiClient from '@/api/apiClient';
import { PRODUCTS_ENDPOINTS } from '@/api/endpoints';

const ImportProducts: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isRTL } = useTheme();
  const [isDragging, setIsDragging] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false); // حالة لمنع النقرات المتعددة

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        toast.loading('جاري استيراد المنتجات...');
        
        const response = await apiClient.post(
          PRODUCTS_ENDPOINTS.IMPORT,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        toast.dismiss();
        
        if (response.data.success) {
          toast.success(response.data.message || `تم استيراد ${response.data.imported} منتج بنجاح`);
          
          if (response.data.errors && response.data.errors.length > 0) {
            toast.warning(`تم تخطي ${response.data.errors.length} صف بسبب أخطاء`);
            console.error('Import errors:', response.data.errors);
          }
          
          setTimeout(() => {
            navigate('/products');
          }, 2000);
        }
      } catch (error: any) {
        toast.dismiss();
        toast.error(error.response?.data?.message || 'فشل في استيراد المنتجات');
        console.error('Import error:', error);
      }
    } else {
      toast.error('يرجى رفع ملف CSV فقط');
    }
  };

  // =================================================================
  // **التعديل الرئيسي هنا: تحديث دالة تنزيل القالب**
  // =================================================================
  /**
   * دالة جديدة لتنزيل القالب من الـ API.
   * تقوم بإرسال طلب إلى الواجهة الخلفية وتنزيل الملف الذي تم توليده ديناميكيًا.
   */
  const handleDownloadTemplate = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    toast.loading('جاري تحضير القالب...');

    try {
      // استدعاء الـ API الجديد الذي قمنا بإنشائه
      const response = await apiClient.get('/products/import/template', {
        responseType: 'blob', // مهم جدًا: التعامل مع الاستجابة كملف
      });

      // إنشاء رابط URL مؤقت للملف الذي تم استلامه من الـ API
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products_template.csv'); // تحديد اسم الملف عند التنزيل
      document.body.appendChild(link);
      link.click();

      // تنظيف الرابط بعد اكتمال التنزيل
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success(t('products.downloadTemplate') + ' تم بنجاح');

    } catch (error) {
      toast.dismiss();
      toast.error('فشل في تحميل القالب. يرجى المحاولة مرة أخرى.');
      console.error('Template download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <BackIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('nav.importProducts')}</h1>
          <p className="text-muted-foreground mt-1">استيراد المنتجات من ملف CSV</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold text-foreground text-lg mb-4">رفع الملف</h3>
          
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="text-foreground font-medium mb-2">اسحب وأفلت ملف CSV هنا</p>
            <p className="text-muted-foreground text-sm mb-4">أو</p>
            <Button asChild variant="outline">
              <label className="cursor-pointer">
                اختر ملف
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold text-foreground text-lg mb-4">تعليمات الاستيراد</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0 text-xs font-bold text-primary-foreground">1</div>
              <p className="text-muted-foreground">قم بتحميل القالب أدناه</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0 text-xs font-bold text-primary-foreground">2</div>
              <p className="text-muted-foreground">املأ بيانات المنتجات في الملف</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0 text-xs font-bold text-primary-foreground">3</div>
              <p className="text-muted-foreground">احفظ الملف بصيغة CSV</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0 text-xs font-bold text-primary-foreground">4</div>
              <p className="text-muted-foreground">ارفع الملف باستخدام النموذج</p>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-6 gap-2" 
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
          >
            <Download className="w-4 h-4" />
            {isDownloading ? 'جاري التحميل...' : t('products.downloadTemplate')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ImportProducts;
