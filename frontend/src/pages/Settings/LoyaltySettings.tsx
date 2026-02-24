import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Gift, Save, Award, Coins, Percent, Loader2, ServerCrash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
// 1. استيراد الـ Hook والخدمة اللازمة
import { useAppSettings } from '@/hooks/useAppSettings';
import { settingsService, AppSettings } from '@/api/settingsService';

// 2. تعريف الحالة الأولية للإعدادات لتجنب الأخطاء
const initialLoyaltySettings = {
  loyalty_enabled: false,
  loyalty_points_per_currency: 1,
  loyalty_currency_per_point: 0.1,
  loyalty_minimum_redemption: 100,
  loyalty_welcome_bonus: 0,
  loyalty_birthday_bonus: 0,
  loyalty_expiry_days: 365,
};

const LoyaltySettings: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // 3. جلب الإعدادات الحقيقية من الواجهة الخلفية
  const { settings: appSettings, isLoading, isError } = useAppSettings();

  // 4. استخدام حالة محلية لتعديلات المستخدم، مع مزامنتها مع البيانات القادمة من الـ API
  const [localSettings, setLocalSettings] = useState(initialLoyaltySettings);

  useEffect(() => {
    if (appSettings) {
      setLocalSettings({
        loyalty_enabled: appSettings.loyalty_enabled ?? false,
        loyalty_points_per_currency: appSettings.loyalty_points_per_currency ?? 1,
        loyalty_currency_per_point: appSettings.loyalty_currency_per_point ?? 0.1,
        loyalty_minimum_redemption: appSettings.loyalty_minimum_redemption ?? 100,
        loyalty_welcome_bonus: appSettings.loyalty_welcome_bonus ?? 0,
        loyalty_birthday_bonus: appSettings.loyalty_birthday_bonus ?? 0,
        loyalty_expiry_days: appSettings.loyalty_expiry_days ?? 365,
      });
    }
  }, [appSettings]);

  // 5. إنشاء mutation لتحديث الإعدادات
  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<AppSettings>) => settingsService.updateSettings(data),
    onSuccess: (data) => {
      // تحديث الكاش بالبيانات الجديدة لضمان التزامن
      queryClient.setQueryData(['settings'], data.data);
      toast.success(t('settings.settingsSaved'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('settings.settingsSaveError'));
    },
  });

  // 6. تحديث دالة الحفظ لتستدعي الـ mutation
  const handleSave = () => {
    updateSettingsMutation.mutate(localSettings);
  };

  // 7. معالجة حالات التحميل والخطأ
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-destructive/10 rounded-lg">
        <ServerCrash className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive">{t('common.errorLoading')}</h2>
        <p className="text-muted-foreground mt-2">{t('common.retry')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Gift className="w-8 h-8 text-primary" />
            {/* يمكنك إضافة مفتاح ترجمة هنا إذا أردت */}
            إعدادات الولاء
          </h1>
          <p className="text-muted-foreground mt-1">إدارة برنامج نقاط الولاء للعملاء</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                حالة البرنامج
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">تفعيل برنامج الولاء</p>
                  <p className="text-sm text-muted-foreground">تشغيل أو إيقاف نظام النقاط للعملاء</p>
                </div>
                <Switch
                  checked={localSettings.loyalty_enabled}
                  onCheckedChange={(checked) => setLocalSettings({ ...localSettings, loyalty_enabled: checked })}
                />
              </div>
              {/* هذه البيانات إحصائية وتحتاج إلى API خاص بها، سنتركها كبيانات ثابتة حاليًا */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <p className="text-3xl font-bold text-primary">1,250</p>
                  <p className="text-sm text-muted-foreground">الأعضاء النشطون</p>
                </div>
                <div className="p-4 rounded-lg bg-success/10 text-center">
                  <p className="text-3xl font-bold text-success">45,800</p>
                  <p className="text-sm text-muted-foreground">إجمالي النقاط المكتسبة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Points Configuration */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-warning" />
                إعدادات النقاط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>معدل كسب النقاط</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localSettings.loyalty_points_per_currency}
                    onChange={(e) => setLocalSettings({ ...localSettings, loyalty_points_per_currency: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">نقطة لكل ريال</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>قيمة استبدال النقاط</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={localSettings.loyalty_currency_per_point}
                    onChange={(e) => setLocalSettings({ ...localSettings, loyalty_currency_per_point: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">ريال لكل نقطة</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>الحد الأدنى للاستبدال</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localSettings.loyalty_minimum_redemption}
                    onChange={(e) => setLocalSettings({ ...localSettings, loyalty_minimum_redemption: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">نقطة</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bonus Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-success" />
                إعدادات المكافآت
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>مكافأة الترحيب</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localSettings.loyalty_welcome_bonus}
                    onChange={(e) => setLocalSettings({ ...localSettings, loyalty_welcome_bonus: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">نقطة للعملاء الجدد</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>مكافأة عيد الميلاد</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localSettings.loyalty_birthday_bonus}
                    onChange={(e) => setLocalSettings({ ...localSettings, loyalty_birthday_bonus: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">نقطة في عيد ميلاد العميل</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expiry Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-destructive" />
                إعدادات انتهاء الصلاحية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>صلاحية النقاط (بالأيام)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={localSettings.loyalty_expiry_days}
                    onChange={(e) => setLocalSettings({ ...localSettings, loyalty_expiry_days: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">يوم من تاريخ الاكتساب</span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm text-warning">سيتم حذف النقاط التي لم تستخدم بعد انتهاء هذه المدة.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          className="gradient-primary border-0 gap-2"
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {updateSettingsMutation.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </div>
  );
};

export default LoyaltySettings;
