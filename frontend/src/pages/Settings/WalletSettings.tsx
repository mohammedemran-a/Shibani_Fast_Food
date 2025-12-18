import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Wallet, CreditCard, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface WalletType {
  id: number;
  name: string;
  nameEn: string;
  icon: string;
  active: boolean;
}

const initialWallets: WalletType[] = [
  { id: 1, name: 'STC Pay', nameEn: 'STC Pay', icon: '📱', active: true },
  { id: 2, name: 'UrPay', nameEn: 'UrPay', icon: '💳', active: true },
  { id: 3, name: 'Apple Pay', nameEn: 'Apple Pay', icon: '🍎', active: true },
  { id: 4, name: 'تحويل بنكي', nameEn: 'Bank Transfer', icon: '🏦', active: true },
  { id: 5, name: 'مدى', nameEn: 'Mada', icon: '💚', active: true },
];

const WalletSettings: React.FC = () => {
  const { t } = useTranslation();
  const [wallets, setWallets] = useState<WalletType[]>(initialWallets);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null);
  const [newWallet, setNewWallet] = useState({ name: '', nameEn: '', icon: '💳' });

  const handleAdd = () => {
    if (!newWallet.name) {
      toast.error(t('wallets.requiredFields'));
      return;
    }
    setWallets([...wallets, { 
      id: Date.now(), 
      ...newWallet, 
      active: true 
    }]);
    setNewWallet({ name: '', nameEn: '', icon: '💳' });
    setIsAddOpen(false);
    toast.success(t('wallets.addSuccess'));
  };

  const handleEdit = () => {
    if (!editingWallet || !editingWallet.name) {
      toast.error(t('wallets.requiredFields'));
      return;
    }
    setWallets(wallets.map(w => w.id === editingWallet.id ? editingWallet : w));
    setIsEditOpen(false);
    setEditingWallet(null);
    toast.success(t('wallets.editSuccess'));
  };

  const openEditDialog = (wallet: WalletType) => {
    setEditingWallet({ ...wallet });
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    setWallets(wallets.filter(w => w.id !== id));
    toast.success(t('wallets.deleteSuccess'));
  };

  const toggleActive = (id: number) => {
    setWallets(wallets.map(w => 
      w.id === id ? { ...w, active: !w.active } : w
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('wallets.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('wallets.subtitle')}</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              {t('wallets.addWallet')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('wallets.addWallet')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('wallets.name')} (عربي) *</Label>
                <Input
                  value={newWallet.name}
                  onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                  placeholder="اسم المحفظة"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('wallets.name')} (English)</Label>
                <Input
                  value={newWallet.nameEn}
                  onChange={(e) => setNewWallet({ ...newWallet, nameEn: e.target.value })}
                  placeholder="Wallet Name"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('wallets.icon')}</Label>
                <Input
                  value={newWallet.icon}
                  onChange={(e) => setNewWallet({ ...newWallet, icon: e.target.value })}
                  placeholder="💳"
                  className="text-center text-2xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleAdd} className="gradient-primary border-0">
                  {t('common.add')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('wallets.editWallet')}</DialogTitle>
          </DialogHeader>
          {editingWallet && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('wallets.name')} (عربي) *</Label>
                <Input
                  value={editingWallet.name}
                  onChange={(e) => setEditingWallet({ ...editingWallet, name: e.target.value })}
                  placeholder="اسم المحفظة"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('wallets.name')} (English)</Label>
                <Input
                  value={editingWallet.nameEn}
                  onChange={(e) => setEditingWallet({ ...editingWallet, nameEn: e.target.value })}
                  placeholder="Wallet Name"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('wallets.icon')}</Label>
                <Input
                  value={editingWallet.icon}
                  onChange={(e) => setEditingWallet({ ...editingWallet, icon: e.target.value })}
                  placeholder="💳"
                  className="text-center text-2xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleEdit} className="gradient-primary border-0">
                  {t('common.save')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Wallets Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wallets.map((wallet, index) => (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-card p-5 ${!wallet.active ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                  {wallet.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{wallet.name}</h4>
                  <p className="text-sm text-muted-foreground">{wallet.nameEn}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(wallet)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(wallet.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">{t('wallets.status')}</span>
              <Button
                variant={wallet.active ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleActive(wallet.id)}
                className={wallet.active ? 'bg-success hover:bg-success/90' : ''}
              >
                {wallet.active ? t('common.active') : t('common.inactive')}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WalletSettings;