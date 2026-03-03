// [تعديل 1] استيراد keepPreviousData
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { employeeService, type CreateEmployeeData, type UpdateEmployeeData } from '@/api/employeeService';
import { toast } from 'sonner';

export const useEmployees = (searchQuery: string = '', page: number = 1) => {
  const queryClient = useQueryClient();

  // 1. جلب قائمة الموظفين
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees', { search: searchQuery, page }],
    queryFn: () => employeeService.getAll({ search: searchQuery, page }),
    // [تعديل 2] استخدام الصيغة الجديدة placeholderData
    placeholderData: keepPreviousData, 
  });

  // 2. جلب قائمة المستخدمين غير المرتبطين (للاستخدام في الفورم)
  const { data: unlinkedUsers, isLoading: isLoadingUnlinkedUsers } = useQuery({
    queryKey: ['unlinkedUsers'],
    queryFn: () => employeeService.getUnlinkedUsers(),
    staleTime: 5 * 60 * 1000, // لا يتم إعادة الجلب إلا بعد 5 دقائق
  });

  // 3. Mutation لإنشاء موظف
  const createEmployeeMutation = useMutation({
    mutationFn: (data: CreateEmployeeData) => employeeService.create(data),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['unlinkedUsers'] }); // تحديث قائمة المستخدمين المتاحين
    },
    onError: (error: any) => {
      const messages = error.response?.data?.errors;
      const firstError = messages ? Object.values(messages)[0] : 'حدث خطأ غير متوقع.';
      toast.error(firstError as string);
    },
  });

  // 4. Mutation لتحديث موظف
  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeData }) => employeeService.update(id, data),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: () => toast.error('فشل تحديث بيانات الموظف.'),
  });

  // 5. Mutation لحذف موظف
  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: number) => employeeService.delete(id),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['unlinkedUsers'] }); // تحديث قائمة المستخدمين المتاحين
    },
    onError: () => toast.error('فشل حذف سجل الموظف.'),
  });

  return {
    employees: employeesData?.data || [],
    pagination: {
      currentPage: employeesData?.current_page,
      lastPage: employeesData?.last_page,
      total: employeesData?.total,
    },
    isLoadingEmployees,
    unlinkedUsers: unlinkedUsers || [],
    isLoadingUnlinkedUsers,
    createEmployee: createEmployeeMutation.mutate,
    isCreating: createEmployeeMutation.isPending,
    updateEmployee: updateEmployeeMutation.mutate,
    isUpdating: updateEmployeeMutation.isPending,
    deleteEmployee: deleteEmployeeMutation.mutate,
    isDeleting: deleteEmployeeMutation.isPending,
  };
};
