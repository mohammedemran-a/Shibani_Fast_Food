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
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'description' => $this->description,
            
            // ✅✅✅ هذا هو الحل: تحويل النصوص إلى أرقام ✅✅✅
            // نستخدم (float) للتأكد من أنها أرقام عشرية
            'price' => $this->whenNotNull((float) $this->price),
            'cost' => $this->whenNotNull((float) $this->cost),
            'stock' => $this->whenNotNull((float) $this->stock),
            
            'unit' => $this->unit,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'is_active' => (bool) $this->is_active, // تحويل إلى boolean
            'preparation_time' => $this->preparation_time,
            'image_url' => $this->image_url,
            
            // تحميل العلاقات (relations) فقط إذا كانت موجودة
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'ingredients' => IngredientResource::collection($this->whenLoaded('ingredients')),
            
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
