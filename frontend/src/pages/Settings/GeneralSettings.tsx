import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Save, Upload, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/api/settingsService';
import PageErrorBoundary from '@/components/PageErrorBoundary';

const GeneralSettingsContent: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string>('');

  // جلب الإعدادات
  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  });

  const [formData, setFormData] = React.useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    tax_rate: 0,
    default_discount: 0,
  });
  // تحديث formData عند تحميل الإعدادات
  React.useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        company_name: settings.company_name || '',
        company_email: settings.company_email || '',
        company_phone: settings.company_phone || '',
        company_address: settings.company_address || '',
        tax_rate: Number(settings.tax_rate) || 0,
        default_discount: Number(settings.default_discount) || 0,
      });
      
      if (settings.company_logo) {
        setLogoPreview(settings.company_logo);
      }
    }
  }, [settings]);

  // تحديث الإعدادات
  const updateMutation = useMutation({
    mutationFn: (data: any) => settingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('تم حفظ الإعدادات بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في حفظ الإعدادات');
    },
  });

  // رفع الشعار
  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => {
      console.log('mutationFn called with file:', file.name, file.size, file.type);
      return settingsService.uploadLogo(file);
    },
    onSuccess: (data) => {
      console.log('Upload success:', data);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      if (data.data?.logo_url) {
        setLogoPreview(data.data.logo_url);
      }
      setLogoFile(null);
      toast.success('تم رفع الشعار بنجاح');
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'فشل في رفع الشعار');
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogo = () => {
    console.log('handleUploadLogo called', { logoFile });
    if (logoFile) {
      console.log('Uploading logo...', logoFile.name, logoFile.size);
      uploadLogoMutation.mutate(logoFile);
    } else {
      console.error('No logo file selected');
      toast.error('يرجى اختيار صورة أولاً');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

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
            <Label htmlFor="companyName">اسم الشركة</Label>
            <Input
              id="companyName"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="أدخل اسم الشركة"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyEmail" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              البريد الإلكتروني
            </Label>
            <Input
              id="companyEmail"
              type="email"
              value={formData.company_email}
              onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
              placeholder="info@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyPhone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              رقم الهاتف
            </Label>
            <Input
              id="companyPhone"
              value={formData.company_phone}
              onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
              placeholder="+966 XX XXX XXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              العنوان
            </Label>
            <Textarea
              id="companyAddress"
              value={formData.company_address}
              onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
              placeholder="أدخل عنوان الشركة"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>الشعار</Label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  id="logoInput"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => document.getElementById('logoInput')?.click()}
                >
                  <Upload className="w-4 h-4" />
                  اختر شعار
                </Button>
                {logoFile && (
                  <Button
                    onClick={handleUploadLogo}
                    disabled={uploadLogoMutation.isPending}
                    size="sm"
                  >
                    {uploadLogoMutation.isPending ? 'جاري الرفع...' : 'رفع الشعار'}
                  </Button>
                )}
              </div>
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
            <Label htmlFor="taxRate">نسبة الضريبة (%)</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.tax_rate}
              onChange={(e) => setFormData({ ...formData, tax_rate: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              نسبة الضريبة المضافة على الفواتير (مثال: 15 للضريبة 15%)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">الخصم الافتراضي (%)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.default_discount}
              onChange={(e) => setFormData({ ...formData, default_discount: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              نسبة الخصم الافتراضية عند إنشاء فاتورة جديدة
            </p>
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </div>
  );
};

// تصدير الصفحة مع حماية ضد الأخطاء
const GeneralSettings: React.FC = () => {
  return (
    <PageErrorBoundary pageName="الإعدادات العامة">
      <GeneralSettingsContent />
    </PageErrorBoundary>
  );
};

export default GeneralSettings;
