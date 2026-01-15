import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit2, Trash2, Receipt, DollarSign,
  TrendingDown, Wallet, Loader2, AlertCircle, X
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
import { expenseService, type Expense, type CreateExpenseData, type UpdateExpenseData } from '@/api/expenseService';

const defaultCategories = [
  { id: 'rent', key: 'expenses.categories.rent' },
  { id: 'utilities', key: 'expenses.categories.utilities' },
  { id: 'salaries', key: 'expenses.categories.salaries' },
  { id: 'supplies', key: 'expenses.categories.supplies' },
  { id: 'maintenance', key: 'expenses.categories.maintenance' },
  { id: 'marketing', key: 'expenses.categories.marketing' },
  { id: 'other', key: 'expenses.categories.other' },
];

interface FormData {
  date: string;
  category: string;
  description: string;
  amount: string;
  notes: string;
}

interface CategoryOption {
  id: string;
  key: string;
  label?: string;
}

const ExpenseManagement: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    amount: '',
    notes: '',
  });

  // Combine default and custom categories
  const allCategories = useMemo(() => [
    ...defaultCategories,
    ...customCategories,
  ], [customCategories]);

  // Fetch expenses
  const { data: expensesResponse, isLoading, error } = useQuery({
    queryKey: ['expenses', currentPage, filterCategory, searchQuery],
    queryFn: () => expenseService.getAll({
      page: currentPage,
      per_page: 10,
      category: filterCategory !== 'all' ? filterCategory : undefined,
      search: searchQuery || undefined,
    }),
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch summary for statistics
  const { data: summaryData } = useQuery({
    queryKey: ['expenses-summary'],
    queryFn: () => expenseService.getSummary(),
    retry: 2,
    staleTime: 1000 * 60 * 5,
  });

  // Create expense mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateExpenseData) => expenseService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(t('expenses.addSuccess'));
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
        resetForm();
      } else {
        toast.error(response.message || t('common.error'));
      }
    },
    onError: (error: any) => {
      console.error('Create expense error:', error);
      let message = t('common.error');
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (typeof errors === 'object') {
          message = Object.values(errors)[0] as string;
        }
      }
      toast.error(message);
    },
  });

  // Update expense mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpenseData }) => 
      expenseService.update(id, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(t('expenses.editSuccess'));
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
        resetForm();
      } else {
        toast.error(response.message || t('common.error'));
      }
    },
    onError: (error: any) => {
      console.error('Update expense error:', error);
      let message = t('common.error');
      if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
    },
  });

  // Delete expense mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => expenseService.delete(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(t('expenses.deleteSuccess'));
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
      } else {
        toast.error(response.message || t('common.error'));
      }
    },
    onError: (error: any) => {
      console.error('Delete expense error:', error);
      let message = t('common.error');
      if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
    },
  });

  // Memoized statistics
  const stats = useMemo(() => ({
    totalExpenses: summaryData?.data?.total_expenses || 0,
    totalByCategory: summaryData?.data?.total_by_category || {},
    monthlyTotal: summaryData?.data?.monthly_total || 0,
  }), [summaryData]);

  const getCategoryLabel = (categoryId: string) => {
    const category = allCategories.find(c => c.id === categoryId);
    if (category) {
      return category.label || t(category.key);
    }
    return categoryId;
  };

  const handleAddNewCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error(t('common.required') || 'هذا الحقل مطلوب');
      return;
    }

    const categoryId = newCategoryName.toLowerCase().replace(/\s+/g, '_');

    if (customCategories.some(c => c.id === categoryId)) {
      toast.error(t('common.alreadyExists') || 'التصنيف موجود بالفعل');
      return;
    }

    const newCategory: CategoryOption = {
      id: categoryId,
      key: '',
      label: newCategoryName,
    };

    setCustomCategories(prev => [...prev, newCategory]);
    setFormData(prev => ({ ...prev, category: categoryId }));
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    toast.success(t('common.success') || 'تم إضافة التصنيف بنجاح');
  };

  const handleAddExpense = () => {
    if (!formData.category || !formData.description || !formData.amount) {
      toast.error(t('expenses.requiredFields'));
      return;
    }

    const data: CreateExpenseData = {
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      notes: formData.notes || undefined,
    };

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDeleteExpense = (id: number) => {
    if (confirm(t('common.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      notes: expense.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      amount: '',
      notes: '',
    });
    setEditingExpense(null);
    setIsAddModalOpen(false);
    setShowNewCategoryInput(false);
    setNewCategoryName('');
  };

  const expenses = expensesResponse?.data?.data || [];
  const pagination = expensesResponse?.data || { current_page: 1, last_page: 1, total: 0 };

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
        <Button className="gradient-primary border-0 gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          {t('expenses.addExpense')}
        </Button>
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
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalExpenses.toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {stats.monthlyTotal.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">{t('expenses.monthlyExpenses')}</p>
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
                <p className="text-2xl font-bold text-foreground">
                  {pagination.total}
                </p>
                <p className="text-sm text-muted-foreground">{t('expenses.totalCount')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={(value) => {
          setFilterCategory(value);
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t('common.category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {allCategories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {getCategoryLabel(cat.id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expenses Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('expenses.list')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span>{t('common.error')}</span>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('expenses.noExpenses')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">{t('common.date')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('common.description')}</th>
                    <th className="text-left py-3 px-4 font-semibold">{t('common.category')}</th>
                    <th className="text-right py-3 px-4 font-semibold">{t('common.amount')}</th>
                    <th className="text-center py-3 px-4 font-semibold">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {expenses.map((expense) => (
                      <motion.tr
                        key={expense.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            {expense.notes && (
                              <p className="text-sm text-muted-foreground">{expense.notes}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            {getCategoryLabel(expense.category)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {expense.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditExpense(expense)}
                              disabled={updateMutation.isPending}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteExpense(expense.id)}
                              disabled={deleteMutation.isPending}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {t('common.page')} {pagination.current_page} {t('common.of')} {pagination.last_page}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.last_page, prev + 1))}
                  disabled={currentPage === pagination.last_page}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? t('expenses.editExpense') : t('expenses.addExpense')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t('common.date')}</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div>
              <Label>{t('common.category')}</Label>
              {showNewCategoryInput ? (
                <div className="flex gap-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t('common.enterCategory') || 'أدخل اسم التصنيف'}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddNewCategory();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddNewCategory}
                  >
                    {t('common.add')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryName('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Select value={formData.category} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {getCategoryLabel(cat.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowNewCategoryInput(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('common.addNewCategory') || 'إضافة تصنيف جديد'}
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label>{t('expenses.description')}</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('common.enterDescription')}
              />
            </div>

            <div>
              <Label>{t('expenses.amount')}</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label>{t('expenses.notes')}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t('common.optionalNotes')}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleAddExpense}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 gap-2"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editingExpense ? t('common.update') : t('common.add')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseManagement;
