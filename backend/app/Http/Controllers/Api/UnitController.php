<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index()
    {
        $units = Unit::all();
        return response()->json(['success' => true, 'data' => $units]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:units',
            'name_ar' => 'required|string|unique:units',
            'abbreviation' => 'required|string',
        ]);

        $unit = Unit::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Unit created successfully',
            'data' => $unit,
        ], 201);
    }

    public function show(Unit $unit)
    {
        return response()->json(['success' => true, 'data' => $unit]);
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'name' => 'string|unique:units,name,' . $unit->id,
            'name_ar' => 'string|unique:units,name_ar,' . $unit->id,
            'abbreviation' => 'string',
        ]);

        $unit->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Unit updated successfully',
            'data' => $unit,
        ]);
    }

    public function destroy(Unit $unit)
    {
        $unit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Unit deleted successfully',
        ]);
    }
}
