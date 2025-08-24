<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'sku',
        'description',
        'retail_price',
        'cost_price',
        'product_count',
        'active'
    ];

    protected $casts = [
        'retail_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'active' => 'boolean'
    ];
}
