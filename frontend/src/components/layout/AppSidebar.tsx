import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { settingsService } from "@/api/settingsService";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  LayoutGrid, // ✅ تمت الإضافة
  Coffee,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  permission?: string;
  children?: NavItem[];
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onToggle }) => {
  const { t } = useTranslation();
  const { isRTL } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([
    "products",
    "reports",
    "people",
    "settings",
    "analytics",
    "employees",
    "Restaurant", // ✅ لإبقائه مفتوح افتراضياً
  ]);

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.getSettings(),
  });

  const navItems: NavItem[] = [
    {
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
      path: "/",
      permission: "view_dashboard",
    },
    {
      label: t("nav.pos"),
      icon: ShoppingCart,
      path: "/pos",
      permission: "access_pos",
    },

    {
      label: t("nav.tablesLayout"),
      icon: LayoutDashboard,
      path: "/tables",
    },
    {
      label: t("nav.kitchenDisplay"), // مفتاح الترجمة الجديد
      icon: Coffee, // أيقونة مناسبة من lucide-react
      path: "/kitchen",
    },
    {
      label: t("nav.products"),
      icon: Package,
      permission: "view_products",
      children: [
        {
          label: t("nav.productsList"),
          icon: List,
          path: "/products",
          permission: "view_products",
        },
        {
          label: t("nav.addProduct"),
          icon: Plus,
          path: "/products/add",
          permission: "create_products",
        },
        {
          label: t("nav.importProducts"),
          icon: Upload,
          path: "/products/import",
          permission: "import_products",
        },
      ],
    },

    {
      label: t("nav.sales"),
      icon: TrendingUp,
      path: "/sales",
      permission: "view_sales",
    },
    {
      label: t("nav.purchases"),
      icon: ShoppingBag,
      path: "/purchases",
      permission: "view_purchases",
    },
    {
      label: t("nav.expenses"),
      icon: Receipt,
      path: "/expenses",
      permission: "view_expenses",
    },
    {
      label: t("nav.debts"),
      icon: Wallet,
      path: "/debts",
      permission: "view_debts",
    },
    {
      label: t("nav.returns"),
      icon: RotateCcw,
      path: "/returns",
      permission: "view_returns",
    },

    {
      label: t("nav.analytics"),
      icon: Lightbulb,
      permission: "view_analytics",
      children: [
        {
          label: t("nav.basketAnalysis"),
          icon: ShoppingBasket,
          path: "/analytics/basket",
          permission: "view_analytics",
        },
        {
          label: t("nav.productPerformance"),
          icon: Award,
          path: "/analytics/products",
          permission: "view_analytics",
        },
      ],
    },

    {
      label: t("nav.reports"),
      icon: BarChart3,
      permission: "view_reports",
      children: [
        {
          label: t("nav.profitReport"),
          icon: DollarSign,
          path: "/reports/profit",
          permission: "view_profit_report",
        },
        {
          label: t("nav.salesReport"),
          icon: FileText,
          path: "/reports/sales",
          permission: "view_reports",
        },
        {
          label: t("nav.summaryReport"),
          icon: PieChart,
          path: "/reports/summary",
          permission: "view_reports",
        },
      ],
    },

    {
      label: t("nav.people"),
      icon: Users,
      permission: "view_customers",
      children: [
        {
          label: t("nav.customers"),
          icon: UserCircle,
          path: "/people/customers",
          permission: "view_customers",
        },
        {
          label: t("nav.suppliers"),
          icon: Truck,
          path: "/people/suppliers",
          permission: "view_suppliers",
        },
        {
          label: t("nav.users"),
          icon: UserCog,
          path: "/people/users",
          permission: "view_users",
        },
      ],
    },

    {
      label: t("nav.employees"),
      icon: UsersRound,
      permission: "view_employees",
      children: [
        {
          label: t("nav.attendance"),
          icon: Clock,
          path: "/employees/attendance",
          permission: "view_attendance",
        },
        {
          label: t("nav.salesPerformance"),
          icon: Award,
          path: "/employees/performance",
          permission: "view_sales_performance",
        },
      ],
    },

    {
      label: t("nav.settings"),
      icon: Settings,
      permission: "view_settings",
      children: [
        {
          label: t("nav.generalSettings"),
          icon: Sliders,
          path: "/settings/general",
          permission: "edit_settings",
        },
        {
          label: t("nav.loyaltySettings"),
          icon: Gift,
          path: "/settings/loyalty",
          permission: "manage_loyalty_settings",
        },
        {
          label: t("nav.wallets"),
          icon: Wallet,
          path: "/settings/wallets",
          permission: "manage_wallet_settings",
        },
        {
          label: t("nav.units"),
          icon: Scale,
          path: "/settings/units",
          permission: "manage_units",
        },
        {
          label: t("nav.currencies"),
          icon: Coins,
          path: "/settings/currencies",
          permission: "manage_currencies",
        },
        {
          label: t("nav.categories"),
          icon: Tags,
          path: "/settings/categories",
          permission: "manage_categories",
        },
        {
          label: t("nav.brands"),
          icon: Bookmark,
          path: "/settings/brands",
          permission: "manage_brands",
        },
        {
          label: t("nav.roles"),
          icon: Shield,
          path: "/settings/roles",
          permission: "view_roles",
        },
      ],
    },
  ];

  // باقي الكود بدون أي تعديل 👇
  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    if (!user) {
      console.log("❌ No user found");
      return false;
    }

    const userPermissions = Array.isArray(user.permissions)
      ? user.permissions
      : [];

    return userPermissions.includes(permission);
  };

  const filteredNavItems = navItems
    .filter((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((child) =>
          hasPermission(child.permission),
        );
        if (filteredChildren.length > 0) {
          return true;
        }
        return hasPermission(item.permission);
      }
      return hasPermission(item.permission);
    })
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) =>
            hasPermission(child.permission),
          ),
        };
      }
      return item;
    });

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  const isActive = (path?: string) => path === location.pathname;
  const hasActiveChild = (children?: NavItem[]) =>
    children?.some((child) => child.path === location.pathname);

  const CollapseIcon = isRTL ? ChevronLeft : ChevronRight;
  const ExpandIcon = isRTL ? ChevronRight : ChevronLeft;

  // Collapsed menu item with popover for children
  const CollapsedMenuItem: React.FC<{ item: NavItem }> = ({ item }) => {
    const displayChildren = item.children;

    if (!displayChildren) {
      return (
        <NavLink
          to={item.path!}
          className={cn(
            "sidebar-item text-sidebar-foreground justify-center",
            isActive(item.path) && "active",
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
              "sidebar-item w-full text-sidebar-foreground justify-center",
              hasActiveChild(displayChildren) && "bg-sidebar-accent",
            )}
            title={item.label}
          >
            <item.icon className="w-5 h-5 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side={isRTL ? "left" : "right"}
          align="start"
          className="w-48 p-2 bg-sidebar border-sidebar-border"
          sideOffset={8}
        >
          <div className="space-y-1">
            <p className="px-2 py-1.5 text-xs font-semibold text-sidebar-foreground/70 uppercase">
              {item.label}
            </p>
            {displayChildren.map((child) => (
              <NavLink
                key={child.path}
                to={child.path!}
                className={cn(
                  "flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors",
                  isActive(child.path) &&
                    "bg-sidebar-accent text-primary font-medium",
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
          "fixed top-0 start-0 h-full bg-sidebar z-[100] transition-all duration-300 flex flex-col shadow-xl",
          isOpen ? "w-64 translate-x-0" : "w-20",
          !isOpen && (isRTL ? "translate-x-full" : "-translate-x-full"),
          "md:translate-x-0 md:static md:h-screen",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            {isLoadingSettings ? (
              <div className="w-10 h-10 rounded-xl bg-sidebar-accent animate-pulse" />
            ) : settings?.company_logo ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img
                  src={settings.company_logo}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
            {isOpen &&
              (isLoadingSettings ? (
                <div className="h-6 w-32 rounded bg-sidebar-accent animate-pulse" />
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-bold text-sidebar-foreground text-lg"
                >
                  {settings?.company_name || "متجري"}
                </motion.span>
              ))}
          </div>
          <button
            onClick={onToggle}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
          >
            {isOpen ? (
              <ExpandIcon className="w-4 h-4" />
            ) : (
              <CollapseIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {filteredNavItems.map((item) => (
              <li key={item.label}>
                {isOpen ? (
                  // Expanded sidebar - normal behavior
                  item.children ? (
                    <div>
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className={cn(
                          "sidebar-item w-full text-sidebar-foreground",
                          hasActiveChild(item.children) && "bg-sidebar-accent",
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        <span className="flex-1 text-start">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform",
                            expandedItems.includes(item.label) && "rotate-180",
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedItems.includes(item.label) && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ms-4 mt-1 space-y-1"
                          >
                            {item.children.map((child) => (
                              <li key={child.path}>
                                <NavLink
                                  to={child.path!}
                                  className={cn(
                                    "sidebar-item text-sidebar-foreground/80 text-sm",
                                    isActive(child.path) && "active",
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
                        "sidebar-item text-sidebar-foreground",
                        isActive(item.path) && "active",
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
