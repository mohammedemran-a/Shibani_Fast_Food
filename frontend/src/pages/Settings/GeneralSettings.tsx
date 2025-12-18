import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Save, Upload, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

const GeneralSettings: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, toggleLanguage } = useTheme();
  const [formData, setFormData] = React.useState({
    companyName: 'متجري',
    taxRate: 15,
    defaultDiscount: 0,
    currency: 'USD',
  });

  const handleSave = () => {
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('nav.generalSettings')}</h1>
        <p className="text-muted-foreground mt-1">إعدادات النظام الأساسية</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            معلومات الشركة
          </h3>

          <div className="space-y-2">
            <Label htmlFor="companyName">{t('settings.companyName')}</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('settings.logo')}</Label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                رفع شعار
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tax & Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 space-y-4"
        >
          <h3 className="font-semibold text-foreground text-lg">الضرائب والأسعار</h3>

          <div className="space-y-2">
            <Label htmlFor="taxRate">{t('settings.taxRate')} (%)</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">{t('settings.defaultDiscount')} (%)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              value={formData.defaultDiscount}
              onChange={(e) => setFormData({ ...formData, defaultDiscount: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('settings.currency')}</Label>
            <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 space-y-4"
        >
          <h3 className="font-semibold text-foreground text-lg">المظهر واللغة</h3>

          <div className="space-y-2">
            <Label>{t('settings.theme')}</Label>
            <div className="flex gap-4">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => theme !== 'light' && toggleTheme()}
                className={theme === 'light' ? 'gradient-primary border-0' : ''}
              >
                {t('settings.light')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={theme === 'dark' ? 'gradient-primary border-0' : ''}
              >
                {t('settings.dark')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('settings.language')}</Label>
            <div className="flex gap-4">
              <Button
                variant={language === 'ar' ? 'default' : 'outline'}
                onClick={() => language !== 'ar' && toggleLanguage()}
                className={language === 'ar' ? 'gradient-primary border-0' : ''}
              >
                العربية
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => language !== 'en' && toggleLanguage()}
                className={language === 'en' ? 'gradient-primary border-0' : ''}
              >
                English
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gradient-primary border-0 gap-2">
          <Save className="w-4 h-4" />
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};

export default GeneralSettings;
