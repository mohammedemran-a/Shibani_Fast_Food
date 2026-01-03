import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Menu, Sun, Moon, Globe, Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '@/api/apiClient';

interface TopBarProps {
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, toggleLanguage } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('token');
      toast.success('تم تسجيل الخروج بنجاح');
      navigate('/login');
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
      localStorage.removeItem('token'); // Force logout even if API fails
      navigate('/login');
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border px-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="shrink-0"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="hidden sm:flex relative max-w-md flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            className="ps-10 bg-muted/50 border-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          className="text-muted-foreground hover:text-foreground"
        >
          <Globe className="w-5 h-5" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 end-2 w-2 h-2 bg-accent rounded-full" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="hidden md:inline font-medium">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('            <DropdownMenuItem onClick={() => navigate('/settings/profile')}>{t('nav.settings')}</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">تسجيل الخروج</DropdownMenuItem>  </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
