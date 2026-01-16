<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Expense::with('cashier');

        if ($request->has('category')) {
            $query->where('description', 'like', '%' . $request->category . '%');
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%$search%")
                  ->orWhere('notes', 'like', "%$search%");
            });
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('expense_date', [$request->start_date, $request->end_date]);
        }

        $expenses = $query->orderBy('expense_date', 'desc')->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $expenses
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'category' => 'nullable|string', // We'll prepend this to description or handle separately
        ]);

        // If category is provided, we can store it as part of description or notes
        // Based on the migration, we only have description, amount, expense_date, cashier_id, notes
        $description = $validated['description'];
        if (!empty($validated['category'])) {
            $description = "[" . $validated['category'] . "] " . $description;
        }

        $expense = Expense::create([
            'description' => $description,
            'amount' => $validated['amount'],
            'expense_date' => $validated['date'],
            'cashier_id' => Auth::id() ?? 1, // Fallback to 1 if not authenticated for testing
            'notes' => $validated['notes'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Expense created successfully',
            'data' => $expense
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Expense $expense)
    {
        return response()->json([
            'success' => true,
            'data' => $expense->load('cashier')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'description' => 'string',
            'amount' => 'numeric|min:0',
            'date' => 'date',
            'notes' => 'nullable|string',
            'category' => 'nullable|string',
        ]);

        $data = [];
        if (isset($validated['amount'])) $data['amount'] = $validated['amount'];
        if (isset($validated['date'])) $data['expense_date'] = $validated['date'];
        if (isset($validated['notes'])) $data['notes'] = $validated['notes'];
        
        if (isset($validated['description'])) {
            $description = $validated['description'];
            if (!empty($validated['category'])) {
                $description = "[" . $validated['category'] . "] " . $description;
            }
            $data['description'] = $description;
        }

        $expense->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Expense updated successfully',
            'data' => $expense
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expense $expense)
    {
        $expense->delete();

        return response()->json([
            'success' => true,
            'message' => 'Expense deleted successfully'
        ]);
    }

    /**
     * Get summary statistics
     */
    public function getSummary()
    {
        $totalExpenses = Expense::sum('amount');
        $monthlyTotal = Expense::whereMonth('expense_date', now()->month)
                               ->whereYear('expense_date', now()->year)
                               ->sum('amount');
        
        // Simple category grouping by parsing the [Category] prefix
        $expenses = Expense::all();
        $totalByCategory = [];
        
        foreach ($expenses as $expense) {
            $category = 'Other';
            if (preg_match('/^\[(.*?)\]/', $expense->description, $matches)) {
                $category = $matches[1];
            }
            
            if (!isset($totalByCategory[$category])) {
                $totalByCategory[$category] = 0;
            }
            $totalByCategory[$category] += $expense->amount;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total_expenses' => $totalExpenses,
                'monthly_total' => $monthlyTotal,
                'total_by_category' => $totalByCategory,
                'average_expense' => $expenses->count() > 0 ? $totalExpenses / $expenses->count() : 0
            ]
        ]);
    }

    /**
     * Get expenses by category
     */
    public function getByCategory(Request $request, $category)
    {
        $query = Expense::with('cashier')
                        ->where('description', 'like', "[$category]%");

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('expense_date', [$request->start_date, $request->end_date]);
        }

        $expenses = $query->orderBy('expense_date', 'desc')->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $expenses
        ]);
    }
}
