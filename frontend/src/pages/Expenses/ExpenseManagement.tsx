import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit2, Trash2, Receipt, Calendar, DollarSign,
  Filter, Download, TrendingDown, Wallet, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { DateRangeFilter } from '@/components/reports/DateRangeFilter';

interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
}

const expenseCategories = [
  { id: 'rent', labelAr: 'إيجار', labelEn: 'Rent' },
  { id: 'utilities', labelAr: 'فواتير', labelEn: 'Utilities' },
  { id: 'salaries', labelAr: 'رواتب', labelEn: 'Salaries' },
  { id: 'supplies', labelAr: 'مستلزمات', labelEn: 'Supplies' },
  { id: 'maintenance', labelAr: 'صيانة', labelEn: 'Maintenance' },
  { id: 'marketing', labelAr: 'تسويق', labelEn: 'Marketing' },
  { id: 'other', labelAr: 'أخرى', labelEn: 'Other' },
];

const initialExpenses: Expense[] = [
  { id: 1, date: '2024-12-18', category: 'rent', description: 'إيجار المحل - ديسمبر', amount: 5000, paymentMethod: 'cash' },
  { id: 2, date: '2024-12-17', category: 'utilities', description: 'فاتورة الكهرباء', amount: 850, paymentMethod: 'wallet' },
  { id: 3, date: '2024-12-16', category: 'salaries', description: 'راتب موظف - أحمد', amount: 3500, paymentMethod: 'cash' },
  { id: 4, date: '2024-12-15', category: 'supplies', description: 'أدوات تنظيف', amount: 120, paymentMethod: 'cash' },
  { id: 5, date: '2024-12-14', category: 'maintenance', description: 'صيانة التكييف', amount: 300, paymentMethod: 'wallet' },
];

const ExpenseManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: '',
    paymentMethod: 'cash',
    reference: '',
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const cashExpenses = expenses.filter(e => e.paymentMethod === 'cash').reduce((sum, e) => sum + e.amount, 0);
  const walletExpenses = expenses.filter(e => e.paymentMethod === 'wallet').reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (categoryId: string) => {
    const category = expenseCategories.find(c => c.id === categoryId);
    return i18n.language === 'ar' ? category?.labelAr : category?.labelEn;
  };

  const handleAddExpense = () => {
    if (!formData.category || !formData.description || !formData.amount) {
      toast.error(t('expenses.requiredFields'));
      return;
    }

    const newExpense: Expense = {
      id: Date.now(),
      date: formData.date,
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      reference: formData.reference,
    };

    if (editingExpense) {
      setExpenses(prev => prev.map(e => e.id === editingExpense.id ? { ...newExpense, id: editingExpense.id } : e));
      toast.success(t('expenses.editSuccess'));
    } else {
      setExpenses(prev => [newExpense, ...prev]);
      toast.success(t('expenses.addSuccess'));
    }

    resetForm();
  };

  const handleDeleteExpense = (id: number) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast.success(t('expenses.deleteSuccess'));
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      paymentMethod: expense.paymentMethod,
      reference: expense.reference || '',
    });
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      amount: '',
      paymentMethod: 'cash',
      reference: '',
    });
    setEditingExpense(null);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Receipt className="w-8 h-8 text-primary" />
            {t('expenses.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('expenses.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <DateRangeFilter />
          <Button className="gradient-primary border-0 gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4" />
            {t('expenses.addExpense')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${totalExpenses.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t('expenses.totalExpenses')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${cashExpenses.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t('expenses.cashExpenses')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${walletExpenses.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t('expenses.walletExpenses')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('expenses.searchExpenses')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 me-2" />
                <SelectValue placeholder={t('expenses.filterByCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('expenses.allCategories')}</SelectItem>
                {expenseCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {i18n.language === 'ar' ? cat.labelAr : cat.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('expenses.expensesList')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {filteredExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <Receipt className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(expense.category)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{expense.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-end">
                      <p className="font-bold text-destructive text-lg">-${expense.amount.toLocaleString()}</p>
                      <Badge variant={expense.paymentMethod === 'cash' ? 'default' : 'secondary'} className="text-xs">
                        {expense.paymentMethod === 'cash' ? t('expenses.cash') : t('expenses.wallet')}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditExpense(expense)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteExpense(expense.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? t('expenses.editExpense') : t('expenses.addExpense')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>{t('expenses.date')}</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('expenses.category')}</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('expenses.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {i18n.language === 'ar' ? cat.labelAr : cat.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('expenses.description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('expenses.descriptionPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('expenses.amount')}</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('expenses.paymentMethod')}</Label>
              <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t('expenses.cash')}</SelectItem>
                  <SelectItem value="wallet">{t('expenses.wallet')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={resetForm}>
                {t('common.cancel')}
              </Button>
              <Button className="flex-1 gradient-primary border-0" onClick={handleAddExpense}>
                {editingExpense ? t('common.save') : t('common.add')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseManagement;
