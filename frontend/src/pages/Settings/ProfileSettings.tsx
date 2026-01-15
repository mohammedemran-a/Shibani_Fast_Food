import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Camera, Lock, LogOut, 
  Loader2, AlertCircle, Save, X, Upload, Trash2, Edit2
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingField, setEditingField] = useState<string | null>(null);
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
  });

  useEffect(() => {
    if (profileResponse?.success && profileResponse.data) {
      setProfileData({
        name: profileResponse.data.name,
        email: profileResponse.data.email,
        phone: profileResponse.data.phone || '',
      });
    }
  }, [profileResponse]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => profileService.updateProfile(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(t('common.success'));
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        setEditingField(null);
      } else {
        toast.error(response.message || t('common.error'));
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('common.error');
      toast.error(message);
    },
  });

  // Update avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: (file: File) => profileService.updateAvatar(file),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(t('common.success'));
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        toast.error(response.message || t('common.error'));
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('common.error');
      toast.error(message);
    },
  });

  // Delete avatar mutation
  const deleteAvatarMutation = useMutation({
    mutationFn: () => profileService.deleteAvatar(),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(t('common.success'));
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        toast.error(response.message || t('common.error'));
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('common.error');
      toast.error(message);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordData) => profileService.changePassword(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(t('common.success'));
        setIsChangingPassword(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
        });
      } else {
        toast.error(response.message || t('common.error'));
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('common.error');
      toast.error(message);
    },
  });

  const handleUpdateField = (field: string) => {
    if (field === 'name' && !profileData.name) {
      toast.error(t('common.requiredFields'));
      return;
    }
    if (field === 'email' && !profileData.email) {
      toast.error(t('common.requiredFields'));
      return;
    }

    updateProfileMutation.mutate(profileData);
  };

  const handleChangePassword = () => {
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirmation) {
      toast.error(t('common.requiredFields'));
      return;
    }

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error(t('auth.passwordMismatch') || 'كلمات المرور غير متطابقة');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error(t('auth.passwordTooShort') || 'كلمة المرور قصيرة جداً');
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t('common.error'));
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(t('common.error'));
        return;
      }
      updateAvatarMutation.mutate(file);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      toast.success(t('auth.logoutSuccess'));
      navigate('/login');
    } catch (error) {
      toast.error(t('auth.logoutError'));
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
            {t('nav.profileSettings')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('settings.personalInfo')}</p>
        </div>
        <Button
          onClick={() => setShowLogoutDialog(true)}
          variant="destructive"
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          {t('auth.logout')}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">{t('common.errorLoading')}</p>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['profile'] })}
              className="mt-4"
            >
              {t('common.retry')}
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && profile && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Avatar Card */}
          <Card className="glass-card lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">{t('settings.logo')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-xl">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-primary" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera className="w-4 h-4" />
                </button>
                {updateAvatarMutation.isPending && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-xl">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.role_name || t('roles.admin')}</p>
              </div>
              <div className="flex gap-2 w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                {avatarUrl && (
                  <Button
                    onClick={() => deleteAvatarMutation.mutate()}
                    disabled={deleteAvatarMutation.isPending}
                    variant="outline"
                    className="flex-1 gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('common.delete')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personal Info Card */}
          <Card className="glass-card lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{t('settings.personalInfo')}</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setIsChangingPassword(true)}
              >
                <Lock className="w-4 h-4" />
                {t('settings.changePassword')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t('common.name')}</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={editingField !== 'name'}
                      className="pl-10"
                    />
                  </div>
                  {editingField === 'name' ? (
                    <div className="flex gap-1">
                      <Button size="icon" onClick={() => handleUpdateField('name')} disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => {
                        setEditingField(null);
                        setProfileData({ ...profileData, name: profile.name });
                      }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="icon" variant="ghost" onClick={() => setEditingField('name')}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t('common.email')}</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={editingField !== 'email'}
                      className="pl-10"
                    />
                  </div>
                  {editingField === 'email' ? (
                    <div className="flex gap-1">
                      <Button size="icon" onClick={() => handleUpdateField('email')} disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => {
                        setEditingField(null);
                        setProfileData({ ...profileData, email: profile.email });
                      }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="icon" variant="ghost" onClick={() => setEditingField('email')}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">{t('common.phone')}</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={editingField !== 'phone'}
                      className="pl-10"
                      placeholder={t('common.notSpecified')}
                    />
                  </div>
                  {editingField === 'phone' ? (
                    <div className="flex gap-1">
                      <Button size="icon" onClick={() => handleUpdateField('phone')} disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => {
                        setEditingField(null);
                        setProfileData({ ...profileData, phone: profile.phone || '' });
                      }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="icon" variant="ghost" onClick={() => setEditingField('phone')}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Change Password Dialog */}
      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('settings.changePassword')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">{t('auth.login.password')}</Label>
              <Input
                id="current_password"
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_password">{t('settings.changePassword')}</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_password_confirmation">{t('common.confirm')}</Label>
              <Input
                id="new_password_confirmation"
                type="password"
                value={passwordData.new_password_confirmation}
                onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending}
                className="gap-2"
              >
                {changePasswordMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('common.save')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(false)}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('auth.logoutConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('auth.logoutConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('auth.logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfileSettings;
