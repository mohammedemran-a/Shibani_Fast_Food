<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // --- 1. إنشاء الأدوار (نفس الأسماء القديمة) ---
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin'], ['description' => 'Full system access']);
        $admin = Role::firstOrCreate(['name' => 'Admin'], ['description' => 'Administrative access']);
        $manager = Role::firstOrCreate(['name' => 'Manager'], ['description' => 'Store management']);
        $cashier = Role::firstOrCreate(['name' => 'Cashier'], ['description' => 'Point of sale operations']);
        // ملاحظة: تم دمج صلاحيات Employee مع Cashier لتبسيط الأمور

        // --- 2. إنشاء الصلاحيات (مزيج من القديم والجديد) ---
        $permissions = [
            // المنتجات (الوجبات والمواد الخام)
            ['name' => 'view_products', 'module' => 'products'],
            ['name' => 'create_products', 'module' => 'products'],
            ['name' => 'edit_products', 'module' => 'products'],
            ['name' => 'delete_products', 'module' => 'products'],
            ['name' => 'import_products', 'module' => 'products'], // أبقينا عليها شكلياً

            // المبيعات
            ['name' => 'view_sales', 'module' => 'sales'],
            ['name' => 'create_sales', 'module' => 'sales'],
            ['name' => 'edit_sales', 'module' => 'sales'], // أبقينا عليها شكلياً
            ['name' => 'delete_sales', 'module' => 'sales'], // أبقينا عليها شكلياً
            ['name' => 'view_sales_summary', 'module' => 'sales'],

            // المشتريات
            ['name' => 'view_purchases', 'module' => 'purchases'],
            ['name' => 'create_purchases', 'module' => 'purchases'],
            ['name' => 'edit_purchases', 'module' => 'purchases'],
            ['name' => 'delete_purchases', 'module' => 'purchases'],
            ['name' => 'view_purchases_summary', 'module' => 'purchases'],

            // **صلاحيات محذوفة (لأن الجداول غير موجودة):**
            // returns, brands, units, loyalty_settings

            // العملاء
            ['name' => 'view_customers', 'module' => 'customers'],
            ['name' => 'create_customers', 'module' => 'customers'],
            ['name' => 'edit_customers', 'module' => 'customers'],
            ['name' => 'delete_customers', 'module' => 'customers'],

            // الموردين
            ['name' => 'view_suppliers', 'module' => 'suppliers'],
            ['name' => 'create_suppliers', 'module' => 'suppliers'],
            ['name' => 'edit_suppliers', 'module' => 'suppliers'],
            ['name' => 'delete_suppliers', 'module' => 'suppliers'],

            // الديون
            ['name' => 'view_debts', 'module' => 'debts'],
            ['name' => 'manage_debts', 'module' => 'debts'],
            ['name' => 'record_debt_payment', 'module' => 'debts'],

            // المصروفات
            ['name' => 'view_expenses', 'module' => 'expenses'],
            ['name' => 'create_expenses', 'module' => 'expenses'],
            ['name' => 'edit_expenses', 'module' => 'expenses'],
            ['name' => 'delete_expenses', 'module' => 'expenses'],

            // التقارير
            ['name' => 'view_reports', 'module' => 'reports'],
            ['name' => 'view_profit_report', 'module' => 'reports'],
            ['name' => 'view_analytics', 'module' => 'reports'],

            // المستخدمين (تم تغيير اسم الموديل من employees إلى users)
            ['name' => 'view_users', 'module' => 'users'],
            ['name' => 'create_users', 'module' => 'users'],
            ['name' => 'edit_users', 'module' => 'users'],
            ['name' => 'delete_users', 'module' => 'users'],
            ['name' => 'view_employees', 'module' => 'employees'], // أبقينا عليها شكلياً لتجنب انهيار الواجهة
            ['name' => 'view_attendance', 'module' => 'employees'],
            ['name' => 'view_sales_performance', 'module' => 'employees'],

            // الأدوار والصلاحيات
            ['name' => 'view_roles', 'module' => 'roles'],
            ['name' => 'create_roles', 'module' => 'roles'],
            ['name' => 'edit_roles', 'module' => 'roles'],
            ['name' => 'delete_roles', 'module' => 'roles'],
            ['name' => 'manage_permissions', 'module' => 'roles'],

            // الإعدادات
            ['name' => 'view_settings', 'module' => 'settings'],
            ['name' => 'edit_settings', 'module' => 'settings'],
            ['name' => 'manage_categories', 'module' => 'settings'],
            ['name' => 'manage_currencies', 'module' => 'settings'],
            ['name' => 'manage_wallet_settings', 'module' => 'settings'], // أبقينا عليها شكلياً

            // لوحة التحكم ونقطة البيع
            ['name' => 'view_dashboard', 'module' => 'dashboard'],
            ['name' => 'access_pos', 'module' => 'pos'],
            ['name' => 'manage_cashier_sessions', 'module' => 'pos'],

            // **صلاحيات جديدة خاصة بنظام المطاعم**
            ['name' => 'manage_modifiers', 'module' => 'products'],
            ['name' => 'manage_inventory_adjustments', 'module' => 'inventory'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission['name']], $permission);
        }

        // --- 3. ربط الصلاحيات بالأدوار ---
        
        // Super Admin يملك كل شيء
        $superAdmin->permissions()->sync(Permission::all()->pluck('id'));

        // Admin يملك كل شيء ما عدا إدارة الصلاحيات وحذف المستخدمين
        $adminPermissions = Permission::whereNotIn('name', ['manage_permissions', 'delete_users', 'delete_roles'])->pluck('id');
        $admin->permissions()->sync($adminPermissions);

        // Manager يملك صلاحيات الإدارة اليومية
        $managerPermissions = Permission::whereIn('module', ['products', 'sales', 'purchases', 'customers', 'suppliers', 'reports', 'employees', 'dashboard', 'pos', 'inventory', 'expenses'])
            ->whereNotIn('name', ['delete_products', 'delete_sales', 'delete_purchases', 'delete_customers', 'delete_suppliers'])
            ->pluck('id');
        $manager->permissions()->sync($managerPermissions);

        // Cashier يملك صلاحيات نقطة البيع الأساسية
        $cashierPermissions = Permission::whereIn('name', [
            'access_pos', 'create_sales', 'view_sales',
            'view_customers', 'create_customers',
            'view_debts', 'record_debt_payment',
            'create_expenses', 'view_expenses',
            'manage_cashier_sessions',
        ])->pluck('id');
        $cashier->permissions()->sync($cashierPermissions);

        // --- 4. إنشاء المستخدمين (بنفس الإيميلات القديمة) ---
        User::firstOrCreate(
            ['email' => 'admin@shibani.com'], // استخدمنا إيميلك المعتاد
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'), // كلمة المرور الافتراضية
                'role_id' => $superAdmin->id,
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'manager@shibani.com'],
            [
                'name' => 'Manager User',
                'password' => Hash::make('password'),
                'role_id' => $manager->id,
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'cashier@shibani.com'],
            [
                'name' => 'Cashier User',
                'password' => Hash::make('password'),
                'role_id' => $cashier->id,
                'is_active' => true,
            ]
        );
    }
}
