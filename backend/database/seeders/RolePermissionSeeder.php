<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // إنشاء الأدوار
        $superAdmin = Role::create([
            'name' => 'Super Admin',
            'name_ar' => 'مسؤول النظام',
            'description' => 'Full system access',
        ]);

        $admin = Role::create([
            'name' => 'Admin',
            'name_ar' => 'مدير',
            'description' => 'Administrative access',
        ]);

        $cashier = Role::create([
            'name' => 'Cashier',
            'name_ar' => 'كاشير',
            'description' => 'Point of sale operations',
        ]);

        $manager = Role::create([
            'name' => 'Manager',
            'name_ar' => 'مدير المتجر',
            'description' => 'Store management',
        ]);

        $employee = Role::create([
            'name' => 'Employee',
            'name_ar' => 'موظف',
            'description' => 'Basic employee access',
        ]);

        // إنشاء الصلاحيات
        $permissions = [
            // صلاحيات المنتجات
            ['name' => 'view_products', 'name_ar' => 'عرض المنتجات', 'module' => 'products'],
            ['name' => 'create_products', 'name_ar' => 'إضافة منتجات', 'module' => 'products'],
            ['name' => 'edit_products', 'name_ar' => 'تعديل المنتجات', 'module' => 'products'],
            ['name' => 'delete_products', 'name_ar' => 'حذف المنتجات', 'module' => 'products'],
            ['name' => 'import_products', 'name_ar' => 'استيراد المنتجات', 'module' => 'products'],

            // صلاحيات المبيعات
            ['name' => 'view_sales', 'name_ar' => 'عرض المبيعات', 'module' => 'sales'],
            ['name' => 'create_sales', 'name_ar' => 'إنشاء فاتورة بيع', 'module' => 'sales'],
            ['name' => 'edit_sales', 'name_ar' => 'تعديل المبيعات', 'module' => 'sales'],
            ['name' => 'delete_sales', 'name_ar' => 'حذف المبيعات', 'module' => 'sales'],
            ['name' => 'view_sales_summary', 'name_ar' => 'عرض ملخص المبيعات', 'module' => 'sales'],

            // صلاحيات المشتريات
            ['name' => 'view_purchases', 'name_ar' => 'عرض المشتريات', 'module' => 'purchases'],
            ['name' => 'create_purchases', 'name_ar' => 'إنشاء فاتورة شراء', 'module' => 'purchases'],
            ['name' => 'edit_purchases', 'name_ar' => 'تعديل المشتريات', 'module' => 'purchases'],
            ['name' => 'delete_purchases', 'name_ar' => 'حذف المشتريات', 'module' => 'purchases'],
            ['name' => 'view_purchases_summary', 'name_ar' => 'عرض ملخص المشتريات', 'module' => 'purchases'],

            // صلاحيات المرتجعات
            ['name' => 'view_returns', 'name_ar' => 'عرض المرتجعات', 'module' => 'returns'],
            ['name' => 'create_returns', 'name_ar' => 'إنشاء مرتجع', 'module' => 'returns'],
            ['name' => 'edit_returns', 'name_ar' => 'تعديل المرتجعات', 'module' => 'returns'],
            ['name' => 'delete_returns', 'name_ar' => 'حذف المرتجعات', 'module' => 'returns'],
            ['name' => 'approve_returns', 'name_ar' => 'الموافقة على المرتجعات', 'module' => 'returns'],

            // صلاحيات العملاء
            ['name' => 'view_customers', 'name_ar' => 'عرض العملاء', 'module' => 'customers'],
            ['name' => 'create_customers', 'name_ar' => 'إضافة عميل', 'module' => 'customers'],
            ['name' => 'edit_customers', 'name_ar' => 'تعديل العملاء', 'module' => 'customers'],
            ['name' => 'delete_customers', 'name_ar' => 'حذف العملاء', 'module' => 'customers'],

            // صلاحيات الموردين
            ['name' => 'view_suppliers', 'name_ar' => 'عرض الموردين', 'module' => 'suppliers'],
            ['name' => 'create_suppliers', 'name_ar' => 'إضافة مورد', 'module' => 'suppliers'],
            ['name' => 'edit_suppliers', 'name_ar' => 'تعديل الموردين', 'module' => 'suppliers'],
            ['name' => 'delete_suppliers', 'name_ar' => 'حذف الموردين', 'module' => 'suppliers'],

            // صلاحيات الديون
            ['name' => 'view_debts', 'name_ar' => 'عرض الديون', 'module' => 'debts'],
            ['name' => 'manage_debts', 'name_ar' => 'إدارة الديون', 'module' => 'debts'],
            ['name' => 'record_debt_payment', 'name_ar' => 'تسجيل دفعة دين', 'module' => 'debts'],

            // صلاحيات المصروفات
            ['name' => 'view_expenses', 'name_ar' => 'عرض المصروفات', 'module' => 'expenses'],
            ['name' => 'create_expenses', 'name_ar' => 'إضافة مصروف', 'module' => 'expenses'],
            ['name' => 'edit_expenses', 'name_ar' => 'تعديل المصروفات', 'module' => 'expenses'],
            ['name' => 'delete_expenses', 'name_ar' => 'حذف المصروفات', 'module' => 'expenses'],

            // صلاحيات التقارير
            ['name' => 'view_reports', 'name_ar' => 'عرض التقارير', 'module' => 'reports'],
            ['name' => 'view_profit_report', 'name_ar' => 'عرض تقرير الأرباح', 'module' => 'reports'],
            ['name' => 'view_analytics', 'name_ar' => 'عرض التحليلات', 'module' => 'reports'],

            // صلاحيات المستخدمين
            ['name' => 'view_users', 'name_ar' => 'عرض المستخدمين', 'module' => 'users'],
            ['name' => 'create_users', 'name_ar' => 'إضافة مستخدم', 'module' => 'users'],
            ['name' => 'edit_users', 'name_ar' => 'تعديل المستخدمين', 'module' => 'users'],
            ['name' => 'delete_users', 'name_ar' => 'حذف المستخدمين', 'module' => 'users'],

            // صلاحيات الأدوار والصلاحيات
            ['name' => 'view_roles', 'name_ar' => 'عرض الأدوار', 'module' => 'roles'],
            ['name' => 'create_roles', 'name_ar' => 'إنشاء دور', 'module' => 'roles'],
            ['name' => 'edit_roles', 'name_ar' => 'تعديل الأدوار', 'module' => 'roles'],
            ['name' => 'delete_roles', 'name_ar' => 'حذف الأدوار', 'module' => 'roles'],
            ['name' => 'manage_permissions', 'name_ar' => 'إدارة الصلاحيات', 'module' => 'roles'],

            // صلاحيات الإعدادات
            ['name' => 'view_settings', 'name_ar' => 'عرض الإعدادات', 'module' => 'settings'],
            ['name' => 'edit_settings', 'name_ar' => 'تعديل الإعدادات', 'module' => 'settings'],
            ['name' => 'manage_categories', 'name_ar' => 'إدارة الفئات', 'module' => 'settings'],
            ['name' => 'manage_brands', 'name_ar' => 'إدارة العلامات التجارية', 'module' => 'settings'],
            ['name' => 'manage_units', 'name_ar' => 'إدارة الوحدات', 'module' => 'settings'],
            ['name' => 'manage_currencies', 'name_ar' => 'إدارة العملات', 'module' => 'settings'],
            ['name' => 'manage_wallet_settings', 'name_ar' => 'إدارة إعدادات المحفظة', 'module' => 'settings'],
            ['name' => 'manage_loyalty_settings', 'name_ar' => 'إدارة إعدادات الولاء', 'module' => 'settings'],

            // صلاحيات الموظفين
            ['name' => 'view_employees', 'name_ar' => 'عرض الموظفين', 'module' => 'employees'],
            ['name' => 'view_attendance', 'name_ar' => 'عرض الحضور', 'module' => 'employees'],
            ['name' => 'view_sales_performance', 'name_ar' => 'عرض أداء المبيعات', 'module' => 'employees'],

            // صلاحيات لوحة التحكم
            ['name' => 'view_dashboard', 'name_ar' => 'عرض لوحة التحكم', 'module' => 'dashboard'],

            // صلاحيات نقطة البيع
            ['name' => 'access_pos', 'name_ar' => 'الوصول إلى نقطة البيع', 'module' => 'pos'],
            ['name' => 'manage_cashier_sessions', 'name_ar' => 'إدارة جلسات الكاشير', 'module' => 'pos'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        // ربط جميع الصلاحيات بـ Super Admin
        $allPermissions = Permission::all();
        $superAdmin->permissions()->sync($allPermissions->pluck('id'));

        // ربط صلاحيات Admin
        $adminPermissions = Permission::whereNotIn('name', [
            'delete_users',
            'delete_roles',
            'manage_permissions',
            'edit_settings',
        ])->get();
        $admin->permissions()->sync($adminPermissions->pluck('id'));

        // ربط صلاحيات Manager
        $managerPermissions = Permission::whereIn('module', ['products', 'sales', 'purchases', 'customers', 'suppliers', 'reports', 'employees', 'dashboard', 'pos'])
            ->whereNotIn('name', ['delete_products', 'delete_sales', 'delete_purchases', 'delete_customers', 'delete_suppliers'])
            ->get();
        $manager->permissions()->sync($managerPermissions->pluck('id'));

        // ربط صلاحيات Cashier
        $cashierPermissions = Permission::whereIn('name', [
            'view_products',
            'create_sales',
            'view_sales',
            'view_customers',
            'create_customers',
            'view_debts',
            'record_debt_payment',
            'create_expenses',
            'view_expenses',
            'view_dashboard',
            'access_pos',
            'manage_cashier_sessions',
        ])->get();
        $cashier->permissions()->sync($cashierPermissions->pluck('id'));

        // ربط صلاحيات Employee
        $employeePermissions = Permission::whereIn('name', [
            'view_products',
            'view_sales',
            'view_customers',
            'view_dashboard',
        ])->get();
        $employee->permissions()->sync($employeePermissions->pluck('id'));

        // إنشاء Super Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@smartpos.com',
            'password' => Hash::make('admin123'),
            'phone' => '+966500000000',
            'role_id' => $superAdmin->id,
            'is_active' => true,
        ]);

        // إنشاء مستخدمين تجريبيين
        User::create([
            'name' => 'أحمد محمد',
            'email' => 'cashier1@smartpos.com',
            'password' => Hash::make('cashier123'),
            'phone' => '+966500000001',
            'role_id' => $cashier->id,
            'is_active' => true,
        ]);

        User::create([
            'name' => 'فاطمة علي',
            'email' => 'cashier2@smartpos.com',
            'password' => Hash::make('cashier123'),
            'phone' => '+966500000002',
            'role_id' => $cashier->id,
            'is_active' => true,
        ]);

        User::create([
            'name' => 'محمود حسن',
            'email' => 'manager@smartpos.com',
            'password' => Hash::make('manager123'),
            'phone' => '+966500000003',
            'role_id' => $manager->id,
            'is_active' => true,
        ]);
    }
}
