<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Combindma\FacebookPixel\Facades\MetaPixel;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::where('active', true)->get();
        
        return Inertia::render('ProductLanding', [
            'products' => $products,
            'success' => session('success')
        ]);
    }

    public function purchase(Request $request)
    {
        $productIds = $request->input('product_ids', []);
        $quantities = $request->input('quantities', []);
        $customerData = $request->input('customer_data', []);
        $paymentMethod = $request->input('payment_method', '');
        
        $products = Product::whereIn('id', $productIds)->get();
        
        $totalCostPrice = 0;
        $totalRetailPrice = 0;
        $orderItems = [];
        
        foreach ($products as $product) {
            $quantity = $quantities[$product->id] ?? 1;
            $totalCostPrice += $product->cost_price * $quantity;
            $totalRetailPrice += $product->retail_price * $quantity;
            
            $orderItems[] = [
                'id' => $product->sku,
                'quantity' => $quantity,
                'price' => $product->cost_price // COST price for Meta Pixel
            ];
        }
        
        $orderId = uniqid('ORDER_', true);
        
        // Server-side Meta Pixel Purchase tracking with COST PRICE
        MetaPixel::track('Purchase', [
            'currency' => 'MYR',
            'value' => $totalCostPrice, // Send COST price, not retail
            'content_ids' => $products->pluck('sku')->toArray(),
            'content_type' => 'product',
            'num_items' => array_sum($quantities),
            'contents' => $orderItems
        ], $orderId); // Use order ID for deduplication
        
        // Here you would normally save to database
        // Order::create([
        //     'order_id' => $orderId,
        //     'customer_data' => $customerData,
        //     'payment_method' => $paymentMethod,
        //     'total_retail' => $totalRetailPrice,
        //     'total_cost' => $totalCostPrice,
        //     'items' => $orderItems
        // ]);
        
        return redirect('/')->with('success', [
            'message' => 'Purchase successful! Order ID: ' . $orderId,
            'order_id' => $orderId,
            'total_cost_price' => $totalCostPrice,
            'total_retail_price' => $totalRetailPrice,
            'customer' => $customerData['name'] ?? 'Guest',
            'payment_method' => $paymentMethod
        ]);
    }
}
