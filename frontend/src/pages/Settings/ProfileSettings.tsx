import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        toast.success(response.message || t('profile.updateSuccess'));
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        setIsEditingProfile(false);
      } else {
        toast.error(response.message || t('profile.updateError'));
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('profile.updateError');
      toast.error(message);
    },
  });

  // Update avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: (file: File) => profileService.updateAvatar(file),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || t('profile.avatarUpdateSuccess'));
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        toast.error(response.message || t('profile.avatarUpdateError'));
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('profile.avatarUpdateError');
      toast.error(message);
    },
  });

  // Delete avatar mutation
  const deleteAvatarMutation = useMutation({
    mutationFn: () => profileService.deleteAvatar(),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || t('profile.avatarDeleteSuccess'));
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        toast.error(response.message || t('profile.avatarDeleteError'));
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('profile.avatarDeleteError');
      toast.error(message);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordData) => profileService.changePassword(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || t('profile.passwordChangeSuccess'));
        setIsChangingPassword(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
        });
      } else {
        toast.error(response.message || t('profile.passwordChangeError'));
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('profile.passwordChangeError');
      toast.error(message);
    },
  });

  const handleUpdateProfile = () => {
    if (!profileData.name || !profileData.email) {
      toast.error(t('profile.nameEmailRequired'));
      return;
    }

    updateProfileMutation.mutate(profileData);
  };

  const handleChangePassword = () => {
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirmation) {
      toast.error(t('profile.allFieldsRequired'));
      return;
    }

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error(t('profile.passwordMismatch'));
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error(t('profile.passwordTooShort'));
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t('profile.avatarTooLarge'));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('profile.avatarInvalidType'));
        return;
      }

      updateAvatarMutation.mutate(file);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('token');
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
            {t('nav.profile')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('profile.subtitle')}</p>
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

      {/* Profile Content */}
      {!isLoading && !error && profile && (
        <>
          {/* Avatar Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{t('profile.avatar')}</CardTitle>
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
                    {t('profile.avatarHelp')}
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
                      {t('common.upload')}
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
                        {t('common.delete')}
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
              <CardTitle>{t('profile.personalInfo')}</CardTitle>
              <Button
                onClick={() => setIsEditingProfile(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <User className="w-4 h-4" />
                {t('common.edit')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('common.name')}</Label>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('common.email')}</Label>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('common.phone')}</Label>
                  <p className="font-medium">{profile.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('common.role')}</Label>
                  <p className="font-medium">{profile.role?.name || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{t('profile.security')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('profile.password')}</p>
                  <p className="text-sm text-muted-foreground">{t('profile.passwordSubtitle')}</p>
                </div>
                <Button
                  onClick={() => setIsChangingPassword(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {t('profile.changePassword')}
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
            <DialogTitle>{t('profile.editProfile')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t('common.name')} *</Label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder={t('profile.namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.email')} *</Label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="example@domain.com"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.phone')}</Label>
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
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    {t('common.saveChanges')}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditingProfile(false)}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('profile.changePassword')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t('profile.currentPassword')} *</Label>
              <Input
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                placeholder={t('profile.currentPasswordPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('profile.newPassword')} *</Label>
              <Input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                placeholder={t('profile.newPasswordPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('profile.confirmNewPassword')} *</Label>
              <Input
                type="password"
                value={passwordData.new_password_confirmation}
                onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                placeholder={t('profile.confirmNewPasswordPlaceholder')}
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
                    {t('common.processing')}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 ml-2" />
                    {t('profile.changePassword')}
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
