import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, Calendar, LogIn, LogOut, User, Loader2, AlertCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangeFilter } from '@/components/reports/DateRangeFilter';
import { toast } from 'sonner';
import { attendanceService, type Attendance } from '@/api/attendanceService';
import { userService } from '@/api/userService';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const AttendanceTracking: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
  });

  // Fetch users for filter
  const { data: usersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });

  // Fetch attendances
  const { data: attendancesResponse, isLoading, error } = useQuery({
    queryKey: ['attendances', selectedUserId, dateRange],
    queryFn: () => attendanceService.getAll({
      user_id: selectedUserId !== 'all' ? parseInt(selectedUserId) : undefined,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
    }),
  });

  // Check in mutation
  const checkInMutation = useMutation({
    mutationFn: () => attendanceService.checkIn(),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'تم تسجيل الحضور بنجاح');
        queryClient.invalidateQueries({ queryKey: ['attendances'] });
      } else {
        toast.error(response.message || 'فشل تسجيل الحضور');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'حدث خطأ أثناء تسجيل الحضور';
      toast.error(message);
    },
  });

  // Check out mutation
  const checkOutMutation = useMutation({
    mutationFn: () => attendanceService.checkOut(),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'تم تسجيل الانصراف بنجاح');
        queryClient.invalidateQueries({ queryKey: ['attendances'] });
      } else {
        toast.error(response.message || 'فشل تسجيل الانصراف');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'حدث خطأ أثناء تسجيل الانصراف';
      toast.error(message);
    },
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-success/10 text-success',
      late: 'bg-warning/10 text-warning',
      absent: 'bg-destructive/10 text-destructive',
      half_day: 'bg-blue-500/10 text-blue-500',
    };
    const labels = {
      present: 'حاضر',
      late: 'متأخر',
      absent: 'غائب',
      half_day: 'نصف يوم',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return format(new Date(`2000-01-01 ${time}`), 'hh:mm a', { locale: ar });
  };

  const formatWorkHours = (hours: number | null) => {
    if (!hours) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const attendances = attendancesResponse?.data?.data || [];
  const users = usersResponse?.data?.data || [];

  // Calculate statistics
  const stats = {
    present: attendances.filter((a: Attendance) => a.status === 'present').length,
    late: attendances.filter((a: Attendance) => a.status === 'late').length,
    absent: attendances.filter((a: Attendance) => a.status === 'absent').length,
    total: users.length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            الحضور والانصراف
          </h1>
          <p className="text-muted-foreground mt-1">إدارة حضور وانصراف الموظفين</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => checkInMutation.mutate()}
            disabled={checkInMutation.isPending}
            className="gradient-primary gap-2"
          >
            {checkInMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            تسجيل حضور
          </Button>
          <Button
            onClick={() => checkOutMutation.mutate()}
            disabled={checkOutMutation.isPending}
            variant="outline"
            className="gap-2"
          >
            {checkOutMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            تسجيل انصراف
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <User className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.present}</p>
                <p className="text-xs text-muted-foreground">حاضر اليوم</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.late}</p>
                <p className="text-xs text-muted-foreground">متأخر اليوم</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <User className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.absent}</p>
                <p className="text-xs text-muted-foreground">غائب اليوم</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">إجمالي الموظفين</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="اختر موظف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الموظفين</SelectItem>
                {users.map((user: any) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">حدث خطأ أثناء تحميل سجلات الحضور</p>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['attendances'] })}
              className="mt-4"
            >
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Attendance Table */}
      {!isLoading && !error && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>سجلات الحضور</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-start py-4 px-4 font-medium text-muted-foreground">الموظف</th>
                    <th className="text-center py-4 px-4 font-medium text-muted-foreground">التاريخ</th>
                    <th className="text-center py-4 px-4 font-medium text-muted-foreground">وقت الحضور</th>
                    <th className="text-center py-4 px-4 font-medium text-muted-foreground">وقت الانصراف</th>
                    <th className="text-center py-4 px-4 font-medium text-muted-foreground">ساعات العمل</th>
                    <th className="text-center py-4 px-4 font-medium text-muted-foreground">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground">
                        لا توجد سجلات حضور
                      </td>
                    </tr>
                  ) : (
                    attendances.map((record: Attendance, index: number) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-medium">{record.user?.name || 'غير محدد'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-muted-foreground">
                          {format(new Date(record.date), 'yyyy-MM-dd', { locale: ar })}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {record.check_in ? (
                            <span className="flex items-center justify-center gap-1 text-success">
                              <LogIn className="w-4 h-4" />
                              {formatTime(record.check_in)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {record.check_out ? (
                            <span className="flex items-center justify-center gap-1 text-primary">
                              <LogOut className="w-4 h-4" />
                              {formatTime(record.check_out)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center text-muted-foreground">
                          {formatWorkHours(record.work_hours)}
                        </td>
                        <td className="py-4 px-4 text-center">{getStatusBadge(record.status)}</td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceTracking;
