<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Package 1 - Single Product',
                'sku' => 'PKG-001',
                'description' => '1 product package deal',
                'retail_price' => 70.00,
                'cost_price' => 40.00,
                'product_count' => 1,
                'active' => true
            ],
            [
                'name' => 'Package 2 - Double Products',
                'sku' => 'PKG-002',
                'description' => '2 products package deal',
                'retail_price' => 130.00,
                'cost_price' => 70.00,
                'product_count' => 2,
                'active' => true
            ],
            [
                'name' => 'Package 3 - Triple Products',
                'sku' => 'PKG-003',
                'description' => '3 products package deal',
                'retail_price' => 150.00,
                'cost_price' => 90.00,
                'product_count' => 3,
                'active' => true
            ]
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
