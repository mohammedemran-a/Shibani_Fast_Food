<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // ✅✅✅ هذا هو الحل: التأكد من أن كل الحقول الأساسية موجودة دائمًا ✅✅✅
        return [
            'id' => $this->id, // <-- التأكد من وجود الـ ID دائمًا
            'name' => $this->name,
            'type' => $this->type,
            'description' => $this->description,
            
            // تحويل النصوص إلى أرقام
            'price' => (float) $this->price,
            'cost' => (float) $this->cost,
            'stock' => (float) $this->stock,
            
            'unit' => $this->unit,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'is_active' => (bool) $this->is_active,
            'preparation_time' => $this->preparation_time,
            'image_url' => $this->image_url,
            
            'category_id' => $this->category_id,
            
            // تحميل العلاقات (relations) فقط إذا كانت موجودة
            'category' => new CategoryResource($this->whenLoaded('category')),
            'ingredients' => IngredientResource::collection($this->whenLoaded('ingredients')),
            
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
