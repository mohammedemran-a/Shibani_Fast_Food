import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Clock, Plus, Calendar, LogIn, LogOut, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangeFilter } from '@/components/reports/DateRangeFilter';

interface AttendanceRecord {
  id: number;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  totalHours: string;
  status: 'present' | 'late' | 'absent';
}

const attendanceData: AttendanceRecord[] = [
  { id: 1, employeeName: 'أحمد محمد', date: '2024-12-17', checkIn: '08:00', checkOut: '16:00', totalHours: '8:00', status: 'present' },
  { id: 2, employeeName: 'سارة علي', date: '2024-12-17', checkIn: '08:15', checkOut: '16:30', totalHours: '8:15', status: 'late' },
  { id: 3, employeeName: 'محمد خالد', date: '2024-12-17', checkIn: '07:55', checkOut: '16:00', totalHours: '8:05', status: 'present' },
  { id: 4, employeeName: 'فاطمة أحمد', date: '2024-12-17', checkIn: null, checkOut: null, totalHours: '-', status: 'absent' },
  { id: 5, employeeName: 'عمر حسن', date: '2024-12-17', checkIn: '08:00', checkOut: null, totalHours: '-', status: 'present' },
];

const AttendanceTracking: React.FC = () => {
  const { t } = useTranslation();
  const [selectedEmployee, setSelectedEmployee] = useState('all');

  const getStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-success/10 text-success',
      late: 'bg-warning/10 text-warning',
      absent: 'bg-destructive/10 text-destructive',
    };
    const labels = {
      present: t('attendance.present'),
      late: t('attendance.late'),
      absent: t('attendance.absent'),
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            {t('attendance.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('attendance.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <DateRangeFilter />
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
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-xs text-muted-foreground">{t('attendance.presentToday')}</p>
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
                <p className="text-2xl font-bold text-foreground">1</p>
                <p className="text-xs text-muted-foreground">{t('attendance.lateToday')}</p>
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
                <p className="text-2xl font-bold text-foreground">1</p>
                <p className="text-xs text-muted-foreground">{t('attendance.absentToday')}</p>
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
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">{t('attendance.totalEmployees')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('attendance.selectEmployee')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('attendance.allEmployees')}</SelectItem>
                <SelectItem value="ahmad">أحمد محمد</SelectItem>
                <SelectItem value="sara">سارة علي</SelectItem>
                <SelectItem value="mohamed">محمد خالد</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('attendance.records')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('attendance.employee')}</th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('attendance.date')}</th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('attendance.checkIn')}</th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('attendance.checkOut')}</th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('attendance.totalHours')}</th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record, index) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-foreground">{record.employeeName}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{record.date}</td>
                    <td className="py-4 px-4 text-center">
                      {record.checkIn ? (
                        <span className="flex items-center justify-center gap-1 text-success">
                          <LogIn className="w-4 h-4" />
                          {record.checkIn}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {record.checkOut ? (
                        <span className="flex items-center justify-center gap-1 text-primary">
                          <LogOut className="w-4 h-4" />
                          {record.checkOut}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{record.totalHours}</td>
                    <td className="py-4 px-4 text-center">{getStatusBadge(record.status)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTracking;