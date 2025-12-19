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
            'description' => 'Full system access',
        ]);

        $admin = Role::create([
            'name' => 'Admin',
            'description' => 'Administrative access',
        ]);

        $cashier = Role::create([
            'name' => 'Cashier',
            'description' => 'Point of sale operations',
        ]);

        $manager = Role::create([
            'name' => 'Manager',
            'description' => 'Store management',
        ]);

        $employee = Role::create([
            'name' => 'Employee',
            'description' => 'Basic employee access',
        ]);

        // إنشاء الصلاحيات
        $permissions = [
            // صلاحيات المنتجات
            ['name' => 'view_products', 'module' => 'products'],
            ['name' => 'create_products', 'module' => 'products'],
            ['name' => 'edit_products', 'module' => 'products'],
            ['name' => 'delete_products', 'module' => 'products'],
            ['name' => 'import_products', 'module' => 'products'],

            // صلاحيات المبيعات
            ['name' => 'view_sales', 'module' => 'sales'],
            ['name' => 'create_sales', 'module' => 'sales'],
            ['name' => 'edit_sales', 'module' => 'sales'],
            ['name' => 'delete_sales', 'module' => 'sales'],
            ['name' => 'view_sales_summary', 'module' => 'sales'],

            // صلاحيات المشتريات
            ['name' => 'view_purchases', 'module' => 'purchases'],
            ['name' => 'create_purchases', 'module' => 'purchases'],
            ['name' => 'edit_purchases', 'module' => 'purchases'],
            ['name' => 'delete_purchases', 'module' => 'purchases'],
            ['name' => 'view_purchases_summary', 'module' => 'purchases'],

            // صلاحيات المرتجعات
            ['name' => 'view_returns', 'module' => 'returns'],
            ['name' => 'create_returns', 'module' => 'returns'],
            ['name' => 'edit_returns', 'module' => 'returns'],
            ['name' => 'delete_returns', 'module' => 'returns'],
            ['name' => 'approve_returns', 'module' => 'returns'],

            // صلاحيات العملاء
            ['name' => 'view_customers', 'module' => 'customers'],
            ['name' => 'create_customers', 'module' => 'customers'],
            ['name' => 'edit_customers', 'module' => 'customers'],
            ['name' => 'delete_customers', 'module' => 'customers'],

            // صلاحيات الموردين
            ['name' => 'view_suppliers', 'module' => 'suppliers'],
            ['name' => 'create_suppliers', 'module' => 'suppliers'],
            ['name' => 'edit_suppliers', 'module' => 'suppliers'],
            ['name' => 'delete_suppliers', 'module' => 'suppliers'],

            // صلاحيات الديون
            ['name' => 'view_debts', 'module' => 'debts'],
            ['name' => 'manage_debts', 'module' => 'debts'],
            ['name' => 'record_debt_payment', 'module' => 'debts'],

            // صلاحيات المصروفات
            ['name' => 'view_expenses', 'module' => 'expenses'],
            ['name' => 'create_expenses', 'module' => 'expenses'],
            ['name' => 'edit_expenses', 'module' => 'expenses'],
            ['name' => 'delete_expenses', 'module' => 'expenses'],

            // صلاحيات التقارير
            ['name' => 'view_reports', 'module' => 'reports'],
            ['name' => 'view_profit_report', 'module' => 'reports'],
            ['name' => 'view_analytics', 'module' => 'reports'],

            // صلاحيات المستخدمين
            ['name' => 'view_users', 'module' => 'users'],
            ['name' => 'create_users', 'module' => 'users'],
            ['name' => 'edit_users', 'module' => 'users'],
            ['name' => 'delete_users', 'module' => 'users'],

            // صلاحيات الأدوار والصلاحيات
            ['name' => 'view_roles', 'module' => 'roles'],
            ['name' => 'create_roles', 'module' => 'roles'],
            ['name' => 'edit_roles', 'module' => 'roles'],
            ['name' => 'delete_roles', 'module' => 'roles'],
            ['name' => 'manage_permissions', 'module' => 'roles'],

            // صلاحيات الإعدادات
            ['name' => 'view_settings', 'module' => 'settings'],
            ['name' => 'edit_settings', 'module' => 'settings'],
            ['name' => 'manage_categories', 'module' => 'settings'],
            ['name' => 'manage_brands', 'module' => 'settings'],
            ['name' => 'manage_units', 'module' => 'settings'],
            ['name' => 'manage_currencies', 'module' => 'settings'],
            ['name' => 'manage_wallet_settings', 'module' => 'settings'],
            ['name' => 'manage_loyalty_settings', 'module' => 'settings'],

            // صلاحيات الموظفين
            ['name' => 'view_employees', 'module' => 'employees'],
            ['name' => 'view_attendance', 'module' => 'employees'],
            ['name' => 'view_sales_performance', 'module' => 'employees'],

            // صلاحيات لوحة التحكم
            ['name' => 'view_dashboard', 'module' => 'dashboard'],

            // صلاحيات نقطة البيع
            ['name' => 'access_pos', 'module' => 'pos'],
            ['name' => 'manage_cashier_sessions', 'module' => 'pos'],
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
