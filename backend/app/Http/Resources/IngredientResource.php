<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IngredientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'unit' => $this->unit,
            // pivot يحتوي على البيانات من الجدول الوسيط (product_ingredients)
            'pivot' => [
                'quantity' => $this->whenPivotLoaded('product_ingredients', function () {
                    return $this->pivot->quantity;
                }),
            ],
        ];
    }
}
