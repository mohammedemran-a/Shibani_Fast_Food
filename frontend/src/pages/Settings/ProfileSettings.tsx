import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Camera, Lock, LogOut, 
  Loader2, AlertCircle, Save, X, Upload, Trash2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { profileService, type UpdateProfileData, type ChangePasswordData } from '@/api/profileService';
import { apiClient } from '@/api/apiClient';

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const [profileData, setProfileData] = useState<UpdateProfileData>({
    name: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  // Fetch profile
  const { data: profileResponse, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
    onSuccess: (data) => {
      if (data.success && data.data) {
        setProfileData({
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone || '',
        });
      }
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => profileService.updateProfile(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'تم تحديث الملف الشخصي بنجاح');
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        setIsEditingProfile(false);
      } else {
        toast.error(response.message || 'فشل تحديث الملف الشخصي');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'حدث خطأ أثناء تحديث الملف الشخصي';
      toast.error(message);
    },
  });

  // Update avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: (file: File) => profileService.updateAvatar(file),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'تم تحديث الصورة الشخصية بنجاح');
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        toast.error(response.message || 'فشل تحديث الصورة الشخصية');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'حدث خطأ أثناء تحديث الصورة الشخصية';
      toast.error(message);
    },
  });

  // Delete avatar mutation
  const deleteAvatarMutation = useMutation({
    mutationFn: () => profileService.deleteAvatar(),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'تم حذف الصورة الشخصية بنجاح');
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        toast.error(response.message || 'فشل حذف الصورة الشخصية');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'حدث خطأ أثناء حذف الصورة الشخصية';
      toast.error(message);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordData) => profileService.changePassword(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'تم تغيير كلمة المرور بنجاح');
        setIsChangingPassword(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
        });
      } else {
        toast.error(response.message || 'فشل تغيير كلمة المرور');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور';
      toast.error(message);
    },
  });

  const handleUpdateProfile = () => {
    if (!profileData.name || !profileData.email) {
      toast.error('الاسم والبريد الإلكتروني مطلوبان');
      return;
    }

    updateProfileMutation.mutate(profileData);
  };

  const handleChangePassword = () => {
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirmation) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('حجم الصورة يجب ألا يتجاوز 2 ميجابايت');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('يجب أن يكون الملف صورة');
        return;
      }

      updateAvatarMutation.mutate(file);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('token');
      toast.success('تم تسجيل الخروج بنجاح');
      navigate('/login');
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const profile = profileResponse?.data;
  const avatarUrl = profile?.avatar ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/storage/${profile.avatar}` : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            الملف الشخصي
          </h1>
          <p className="text-muted-foreground mt-1">إدارة معلوماتك الشخصية</p>
        </div>
        <Button
          onClick={() => setShowLogoutDialog(true)}
          variant="destructive"
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </Button>
      </div>

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
            <p className="text-destructive">حدث خطأ أثناء تحميل الملف الشخصي</p>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['profile'] })}
              className="mt-4"
            >
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Profile Content */}
      {!isLoading && !error && profile && (
        <>
          {/* Avatar Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>الصورة الشخصية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-primary" />
                    )}
                  </div>
                  {updateAvatarMutation.isPending && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    صورة بصيغة JPG أو PNG. الحد الأقصى 2 ميجابايت.
                  </p>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={updateAvatarMutation.isPending}
                      variant="outline"
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      رفع صورة
                    </Button>
                    {avatarUrl && (
                      <Button
                        onClick={() => deleteAvatarMutation.mutate()}
                        disabled={deleteAvatarMutation.isPending}
                        variant="destructive"
                        className="gap-2"
                      >
                        {deleteAvatarMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        حذف
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>المعلومات الشخصية</CardTitle>
              <Button
                onClick={() => setIsEditingProfile(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <User className="w-4 h-4" />
                تعديل
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">الاسم</Label>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">البريد الإلكتروني</Label>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">رقم الهاتف</Label>
                  <p className="font-medium">{profile.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الدور الوظيفي</Label>
                  <p className="font-medium">{profile.role?.name || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>الأمان</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">كلمة المرور</p>
                  <p className="text-sm text-muted-foreground">آخر تغيير منذ فترة</p>
                </div>
                <Button
                  onClick={() => setIsChangingPassword(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <Lock className="w-4 h-4" />
                  تغيير كلمة المرور
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المعلومات الشخصية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>الاسم الكامل *</Label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="أدخل الاسم الكامل"
              />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني *</Label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="example@domain.com"
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+966XXXXXXXXX"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleUpdateProfile}
                disabled={updateProfileMutation.isPending}
                className="flex-1 gradient-primary"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditingProfile(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغيير كلمة المرور</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>كلمة المرور الحالية *</Label>
              <Input
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                placeholder="أدخل كلمة المرور الحالية"
              />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور الجديدة *</Label>
              <Input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                placeholder="أدخل كلمة المرور الجديدة"
              />
            </div>
            <div className="space-y-2">
              <Label>تأكيد كلمة المرور الجديدة *</Label>
              <Input
                type="password"
                value={passwordData.new_password_confirmation}
                onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending}
                className="flex-1 gradient-primary"
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري التغيير...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 ml-2" />
                    تغيير كلمة المرور
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: '',
                  });
                }}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد تسجيل الخروج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من تسجيل الخروج من النظام؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              تسجيل الخروج
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfileSettings;
