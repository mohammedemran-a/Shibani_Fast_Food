import React, { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { motion } from 'framer-motion';
import { useEmployees } from '@/hooks/useEmployees';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { AddEditEmployeeModal } from '@/components/employee/AddEditEmployeeModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Employee } from '@/api/employeeService';

// ========= التعديل هنا =========
const formatSalary = (employee: Employee) => {
  // تحويل القيمة إلى رقم باستخدام parseFloat
  const salaryNum = parseFloat(employee.salary as any);
  const hourlyRateNum = parseFloat(employee.hourly_rate as any);

  // التحقق مما إذا كانت القيمة رقمًا صالحًا (ليست NaN)
  if (employee.salary_type === 'monthly' && !isNaN(salaryNum)) {
    return `${salaryNum.toFixed(2)} / شهري`;
  }
  if (employee.salary_type === 'hourly' && !isNaN(hourlyRateNum)) {
    return `${hourlyRateNum.toFixed(2)} / ساعة`;
  }
  
  // إذا لم تكن القيمة رقمًا صالحًا بعد التحويل، نعرض N/A
  return 'N/A';
};
// ========= نهاية التعديل =========

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return dateString;
  }
};

const EmployeesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<number | null>(null);
  
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 300);

  const {
    employees,
    pagination,
    isLoadingEmployees,
    deleteEmployee,
    isDeleting,
  } = useEmployees(debouncedSearch, page);

  const handleAddClick = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteEmployeeId) {
      deleteEmployee(deleteEmployeeId, {
        onSuccess: () => setDeleteEmployeeId(null),
      });
    }
  };

  const tableHeaders = [
    'اسم الموظف',
    'المسمى الوظيفي',
    'القسم',
    'الراتب',
    'تاريخ التوظيف',
    'الإجراءات',
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">سجلات الموظفين</h1>
          <p className="text-muted-foreground mt-1">إدارة بيانات الموظفين الوظيفية والمالية.</p>
        </div>
        <Button onClick={handleAddClick} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة سجل موظف
        </Button>
      </header>

      <div className="bg-card border rounded-xl p-4 space-y-4">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن موظف بالاسم أو الإيميل..."
            className="ps-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50">
            {tableHeaders.map(header => (
              <div key={header} className="font-medium text-muted-foreground text-sm text-center">
                {header}
              </div>
            ))}
          </div>

          <div className="divide-y divide-border">
            {isLoadingEmployees && page === 1 ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : employees.length > 0 ? (
              employees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-muted/30 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="text-sm font-medium text-foreground text-center break-words">{employee.user.name}</div>
                  <div className="text-sm text-muted-foreground text-center break-words">{employee.job_title}</div>
                  <div className="text-sm text-muted-foreground text-center break-words">{employee.department || '-'}</div>
                  <div className="text-sm text-muted-foreground text-center font-mono break-words">{formatSalary(employee)}</div>
                  <div className="text-sm text-muted-foreground text-center break-words">{formatDate(employee.hire_date)}</div>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(employee)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteEmployeeId(employee.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col justify-center items-center h-48 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>لا يوجد موظفين لعرضهم.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>

      {isModalOpen && (
        <AddEditEmployeeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          employee={editingEmployee}
        />
      )}

      <AlertDialog open={!!deleteEmployeeId} onOpenChange={() => setDeleteEmployeeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف سجل الموظف فقط. سيبقى حساب المستخدم موجودًا.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'نعم، قم بالحذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeesPage;
