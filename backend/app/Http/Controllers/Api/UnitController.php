<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index(Request $request)
    {
        $query = Unit::with(['parentUnit', 'subUnits']);
        
        // Filter by parent_unit_id if provided
        if ($request->has('parent_only') && $request->parent_only == 'true') {
            $query->whereNull('parent_unit_id');
        }
        
        $units = $query->get();
        return response()->json(['success' => true, 'data' => $units]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:units',
            'abbreviation' => 'required|string',
            'parent_unit_id' => 'nullable|exists:units,id',
            'conversion_factor' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        // Set default conversion factor for sub-units
        if (!empty($validated['parent_unit_id']) && empty($validated['conversion_factor'])) {
            $validated['conversion_factor'] = 1;
        }

        $unit = Unit::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Unit created successfully',
            'data' => $unit->load(['parentUnit', 'subUnits']),
        ], 201);
    }

    public function show(Unit $unit)
    {
        return response()->json([
            'success' => true, 
            'data' => $unit->load(['parentUnit', 'subUnits'])
        ]);
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'name' => 'string|unique:units,name,' . $unit->id,
            'abbreviation' => 'string',
            'parent_unit_id' => 'nullable|exists:units,id',
            'conversion_factor' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        // Prevent circular reference
        if (!empty($validated['parent_unit_id']) && $validated['parent_unit_id'] == $unit->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unit cannot be its own parent',
            ], 422);
        }

        $unit->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Unit updated successfully',
            'data' => $unit->load(['parentUnit', 'subUnits']),
        ]);
    }

    public function destroy(Unit $unit)
    {
        // Check if unit has sub-units
        if ($unit->subUnits()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete unit with sub-units. Delete sub-units first.',
            ], 422);
        }

        // Check if unit is used by products
        if ($unit->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete unit that is used by products.',
            ], 422);
        }

        $unit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Unit deleted successfully',
        ]);
    }
}
