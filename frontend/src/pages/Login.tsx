import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/api';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { login: authContextLogin } = useAuth();

  const loginSchema = z.object({
    email: z.string().email(t('auth.login.invalidEmail') || 'البريد الإلكتروني غير صحيح'),
    password: z.string().min(6, t('auth.login.passwordTooShort') || 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@smartpos.com',
      password: 'admin123',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        email: values.email,
        password: values.password,
      });

      if (response.success && response.data?.token && response.data?.user) {
        authContextLogin(response.data.token, response.data.user);
        toast({
          title: t('common.success'),
          description: t('auth.login.welcomeBack'),
          variant: 'default',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: t('auth.login.error'),
          description: t('auth.login.invalidCredentials'),
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message === 'The provided credentials are incorrect.' 
        ? t('auth.login.invalidCredentials') 
        : (error.response?.data?.message || t('auth.login.invalidCredentials'));
      
      toast({
        title: t('auth.login.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-orange-600 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-white rounded-lg p-2">
              <ShoppingCart className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-white">Smart POS</h1>
          </div>
          <p className="text-blue-100">Point of Sale Management System</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-center">{t('auth.login.welcomeBack')}</CardTitle>
            <CardDescription className="text-center">
              {t('auth.login.signInToContinue')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.login.emailAddress')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@smartpos.com"
                          disabled={isLoading}
                          {...field}
                          className="bg-gray-50 border-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.login.password')}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                          {...field}
                          className="bg-gray-50 border-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white h-10 font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.login.signingIn')}
                    </>
                  ) : (
                    t('auth.login.signIn')
                  )}
                </Button>
              </form>
            </Form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">{t('auth.login.demoCredentials')}:</p>
              <div className="space-y-1 text-sm text-blue-800">
                <p>
                  <strong>{t('auth.login.admin')}:</strong> admin@smartpos.com / admin123
                </p>
                <p>
                  <strong>{t('auth.login.cashier')}:</strong> cashier1@smartpos.com / cashier123
                </p>
                <p>
                  <strong>{t('auth.login.manager')}:</strong> manager@smartpos.com / manager123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-blue-100 text-sm">
          <p>{t('auth.login.copyright')}</p>
        </div>
      </div>
    </div>
  );
}
