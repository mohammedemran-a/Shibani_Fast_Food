import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Upload, FileSpreadsheet, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

const ImportProducts: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isRTL } = useTheme();
  const [isDragging, setIsDragging] = React.useState(false);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      toast.success(`تم رفع الملف: ${file.name}`);
      // TODO: Process CSV file and import products
    } else {
      toast.error('يرجى رفع ملف CSV فقط');
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/products-template.csv';
    link.download = 'products-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t('products.downloadTemplate') + ' تم بنجاح');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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
        {/* Upload Area */}
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
            <label>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>اختر ملف</span>
              </Button>
            </label>
          </div>
        </motion.div>

        {/* Instructions */}
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

          <Button variant="outline" className="w-full mt-6 gap-2" onClick={handleDownloadTemplate}>
            <Download className="w-4 h-4" />
            {t('products.downloadTemplate')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ImportProducts;
