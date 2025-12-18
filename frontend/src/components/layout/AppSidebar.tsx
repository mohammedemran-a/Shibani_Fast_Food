import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  TrendingUp,
  ShoppingBag,
  RotateCcw,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Store,
  List,
  Plus,
  Upload,
  DollarSign,
  FileText,
  PieChart,
  UserCircle,
  Truck,
  UserCog,
  Sliders,
  Scale,
  Coins,
  Tags,
  Bookmark,
  Shield,
  Wallet,
  Lightbulb,
  ShoppingBasket,
  Award,
  Clock,
  Gift,
  UsersRound,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: NavItem[];
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onToggle }) => {
  const { t } = useTranslation();
  const { isRTL } = useTheme();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['products', 'reports', 'people', 'settings', 'analytics', 'employees']);

  const navItems: NavItem[] = [
    { label: t('nav.dashboard'), icon: LayoutDashboard, path: '/' },
    { label: t('nav.pos'), icon: ShoppingCart, path: '/pos' },
    {
      label: t('nav.products'),
      icon: Package,
      children: [
        { label: t('nav.productsList'), icon: List, path: '/products' },
        { label: t('nav.addProduct'), icon: Plus, path: '/products/add' },
        { label: t('nav.importProducts'), icon: Upload, path: '/products/import' },
      ],
    },
    { label: t('nav.sales'), icon: TrendingUp, path: '/sales' },
    { label: t('nav.purchases'), icon: ShoppingBag, path: '/purchases' },
    { label: t('nav.expenses'), icon: Receipt, path: '/expenses' },
    { label: t('nav.debts'), icon: Wallet, path: '/debts' },
    { label: t('nav.returns'), icon: RotateCcw, path: '/returns' },
    {
      label: t('nav.analytics'),
      icon: Lightbulb,
      children: [
        { label: t('nav.basketAnalysis'), icon: ShoppingBasket, path: '/analytics/basket' },
        { label: t('nav.productPerformance'), icon: Award, path: '/analytics/products' },
      ],
    },
    {
      label: t('nav.reports'),
      icon: BarChart3,
      children: [
        { label: t('nav.profitReport'), icon: DollarSign, path: '/reports/profit' },
        { label: t('nav.salesReport'), icon: FileText, path: '/reports/sales' },
        { label: t('nav.summaryReport'), icon: PieChart, path: '/reports/summary' },
      ],
    },
    {
      label: t('nav.people'),
      icon: Users,
      children: [
        { label: t('nav.customers'), icon: UserCircle, path: '/people/customers' },
        { label: t('nav.suppliers'), icon: Truck, path: '/people/suppliers' },
        { label: t('nav.users'), icon: UserCog, path: '/people/users' },
      ],
    },
    {
      label: t('nav.employees'),
      icon: UsersRound,
      children: [
        { label: t('nav.attendance'), icon: Clock, path: '/employees/attendance' },
        { label: t('nav.salesPerformance'), icon: Award, path: '/employees/performance' },
      ],
    },
    {
      label: t('nav.settings'),
      icon: Settings,
      children: [
        { label: t('nav.generalSettings'), icon: Sliders, path: '/settings/general' },
        { label: t('nav.loyaltySettings'), icon: Gift, path: '/settings/loyalty' },
        { label: t('nav.wallets'), icon: Wallet, path: '/settings/wallets' },
        { label: t('nav.units'), icon: Scale, path: '/settings/units' },
        { label: t('nav.currencies'), icon: Coins, path: '/settings/currencies' },
        { label: t('nav.categories'), icon: Tags, path: '/settings/categories' },
        { label: t('nav.brands'), icon: Bookmark, path: '/settings/brands' },
        { label: t('nav.roles'), icon: Shield, path: '/settings/roles' },
      ],
    },
  ];

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  const isActive = (path?: string) => path === location.pathname;
  const hasActiveChild = (children?: NavItem[]) =>
    children?.some(child => child.path === location.pathname);

  const CollapseIcon = isRTL ? ChevronLeft : ChevronRight;
  const ExpandIcon = isRTL ? ChevronRight : ChevronLeft;

  // Collapsed menu item with popover for children
  const CollapsedMenuItem: React.FC<{ item: NavItem }> = ({ item }) => {
    if (!item.children) {
      return (
        <NavLink
          to={item.path!}
          className={cn(
            'sidebar-item text-sidebar-foreground justify-center',
            isActive(item.path) && 'active'
          )}
          title={item.label}
        >
          <item.icon className="w-5 h-5 shrink-0" />
        </NavLink>
      );
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'sidebar-item w-full text-sidebar-foreground justify-center',
              hasActiveChild(item.children) && 'bg-sidebar-accent'
            )}
            title={item.label}
          >
            <item.icon className="w-5 h-5 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          side={isRTL ? 'left' : 'right'} 
          align="start" 
          className="w-48 p-2 bg-sidebar border-sidebar-border"
          sideOffset={8}
        >
          <div className="space-y-1">
            <p className="px-2 py-1.5 text-xs font-semibold text-sidebar-foreground/70 uppercase">
              {item.label}
            </p>
            {item.children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path!}
                className={cn(
                  'flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors',
                  isActive(child.path) && 'bg-sidebar-accent text-primary font-medium'
                )}
              >
                <child.icon className="w-4 h-4 shrink-0" />
                <span>{child.label}</span>
              </NavLink>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 md:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 start-0 h-full bg-sidebar z-50 transition-all duration-300 flex flex-col',
          isOpen ? 'w-64' : 'w-20',
          'md:translate-x-0',
          !isOpen && 'max-md:-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-sidebar-foreground text-lg"
              >
                {t('app.name')}
              </motion.span>
            )}
          </div>
          <button
            onClick={onToggle}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
          >
            {isOpen ? <ExpandIcon className="w-4 h-4" /> : <CollapseIcon className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.label}>
                {isOpen ? (
                  // Expanded sidebar - normal behavior
                  item.children ? (
                    <div>
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className={cn(
                          'sidebar-item w-full text-sidebar-foreground',
                          hasActiveChild(item.children) && 'bg-sidebar-accent'
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        <span className="flex-1 text-start">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 transition-transform',
                            expandedItems.includes(item.label) && 'rotate-180'
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedItems.includes(item.label) && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ms-4 mt-1 space-y-1"
                          >
                            {item.children.map((child) => (
                              <li key={child.path}>
                                <NavLink
                                  to={child.path!}
                                  className={cn(
                                    'sidebar-item text-sidebar-foreground/80 text-sm',
                                    isActive(child.path) && 'active'
                                  )}
                                >
                                  <child.icon className="w-4 h-4 shrink-0" />
                                  <span>{child.label}</span>
                                </NavLink>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <NavLink
                      to={item.path!}
                      className={cn(
                        'sidebar-item text-sidebar-foreground',
                        isActive(item.path) && 'active'
                      )}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                ) : (
                  // Collapsed sidebar - use popover for children
                  <CollapsedMenuItem item={item} />
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};
