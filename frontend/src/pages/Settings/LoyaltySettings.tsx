import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Gift, Save, Award, Coins, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const LoyaltySettings: React.FC = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    enabled: true,
    pointsPerCurrency: 1,
    currencyPerPoint: 0.1,
    minimumRedemption: 100,
    welcomeBonus: 50,
    birthdayBonus: 100,
    expiryDays: 365,
  });

  const handleSave = () => {
    toast.success(t('loyalty.settingsSaved'));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Gift className="w-8 h-8 text-primary" />
            {t('loyalty.settingsTitle')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('loyalty.settingsSubtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                {t('loyalty.programStatus')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">{t('loyalty.enableProgram')}</p>
                  <p className="text-sm text-muted-foreground">{t('loyalty.enableProgramDesc')}</p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <p className="text-3xl font-bold text-primary">1,250</p>
                  <p className="text-sm text-muted-foreground">{t('loyalty.activeMembers')}</p>
                </div>
                <div className="p-4 rounded-lg bg-success/10 text-center">
                  <p className="text-3xl font-bold text-success">45,800</p>
                  <p className="text-sm text-muted-foreground">{t('loyalty.totalPointsIssued')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Points Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-warning" />
                {t('loyalty.pointsConfig')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('loyalty.pointsPerCurrency')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.pointsPerCurrency}
                    onChange={(e) => setSettings({ ...settings, pointsPerCurrency: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">{t('loyalty.pointsPerCurrencyDesc')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('loyalty.currencyPerPoint')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.currencyPerPoint}
                    onChange={(e) => setSettings({ ...settings, currencyPerPoint: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">{t('loyalty.currencyPerPointDesc')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('loyalty.minimumRedemption')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.minimumRedemption}
                    onChange={(e) => setSettings({ ...settings, minimumRedemption: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">{t('loyalty.minimumRedemptionDesc')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bonus Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-success" />
                {t('loyalty.bonusSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('loyalty.welcomeBonus')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.welcomeBonus}
                    onChange={(e) => setSettings({ ...settings, welcomeBonus: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">{t('loyalty.welcomeBonusDesc')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('loyalty.birthdayBonus')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.birthdayBonus}
                    onChange={(e) => setSettings({ ...settings, birthdayBonus: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">{t('loyalty.birthdayBonusDesc')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expiry Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-destructive" />
                {t('loyalty.expirySettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('loyalty.expiryDays')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.expiryDays}
                    onChange={(e) => setSettings({ ...settings, expiryDays: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">{t('loyalty.expiryDaysDesc')}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm text-warning">{t('loyalty.expiryWarning')}</p>
              </div>
            </CardContent>
          </Card>
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

export default LoyaltySettings;