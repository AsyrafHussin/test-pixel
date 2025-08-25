<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Order;
use App\Services\ToyyibPayService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Combindma\FacebookPixel\Facades\MetaPixel;
use Illuminate\Support\Facades\Log;

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
        
        // Validate required fields
        $request->validate([
            'product_ids' => 'required|array',
            'quantities' => 'required|array',
            'customer_data.name' => 'required|string',
            'customer_data.email' => 'required|email',
            'customer_data.phone' => 'required|string',
            'customer_data.address' => 'required|string',
            'customer_data.city' => 'required|string',
            'customer_data.postal_code' => 'required|string',
            'customer_data.state' => 'required|string',
            'payment_method' => 'required|string|in:fpx,cod',
        ]);
        
        $products = Product::whereIn('id', $productIds)->get();
        
        if ($products->isEmpty()) {
            return redirect('/')->with('error', 'No products found');
        }
        
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
        
        $orderId = 'ORD' . strtoupper(substr(uniqid(), -8));
        
        // Create order in database
        $order = Order::create([
            'order_id' => $orderId,
            'product_ids' => $productIds,
            'quantities' => $quantities,
            'customer_data' => $customerData,
            'state' => $customerData['state'] ?? null,
            'payment_method' => $paymentMethod,
            'total_cost_price' => $totalCostPrice,
            'total_retail_price' => $totalRetailPrice,
            'payment_status' => $paymentMethod === 'cod' ? 'success' : 'pending',
            'paid_at' => $paymentMethod === 'cod' ? now() : null,
        ]);

        // Meta Pixel Purchase tracking will be sent later:
        // - For FPX: After payment confirmation (in callback)  
        // - For COD: Immediately after order save (below)
        
        // Handle payment method
        if ($paymentMethod === 'fpx') {
            // Create ToyyibPay bill for FPX payment
            try {
                $toyyibPayService = new ToyyibPayService();
                $billData = $toyyibPayService->createBill([
                    'order_id' => $orderId,
                    'total_retail_price' => $totalRetailPrice,
                    'customer_data' => $customerData,
                ]);

                // Update order with ToyyibPay bill information
                $order->update([
                    'toyyibpay_bill_code' => $billData['bill_code'],
                    'toyyibpay_bill_url' => $billData['bill_url'],
                ]);

                Log::info('Order created with ToyyibPay bill', [
                    'order_id' => $orderId,
                    'bill_code' => $billData['bill_code']
                ]);

                // Show redirect page instead of direct redirect
                return Inertia::render('PaymentRedirect', [
                    'billUrl' => $billData['bill_url'],
                    'orderData' => [
                        'order_id' => $orderId,
                        'total_retail_price' => number_format($totalRetailPrice, 2),
                        'customer_name' => $customerData['name'],
                    ]
                ]);
                
            } catch (\Exception $e) {
                Log::error('ToyyibPay bill creation failed', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage()
                ]);

                // Update order status to failed
                $order->update(['payment_status' => 'failed']);
                
                return redirect('/')->with('error', 'Payment gateway error. Please try again.');
            }
        } else {
            // COD - order is already marked as success, send Meta Pixel immediately
            MetaPixel::track('Purchase', [
                'currency' => 'MYR',
                'value' => $totalCostPrice, // Send COST price, not retail
                'content_ids' => $products->pluck('sku')->toArray(),
                'content_type' => 'product',
                'num_items' => array_sum($quantities),
                'contents' => $orderItems
            ], $orderId); // Use order ID for deduplication
            
            // Mark Meta Pixel as sent for COD orders
            $order->update([
                'meta_pixel_purchase_sent' => true,
                'meta_pixel_purchase_sent_at' => now(),
            ]);
            
            Log::info('COD order created successfully with Meta Pixel', ['order_id' => $orderId]);
            
            return redirect('/')->with('success', [
                'message' => 'Order placed successfully! (Cash on Delivery)',
                'order_id' => $orderId,
                'total_cost_price' => (float) $totalCostPrice,
                'total_retail_price' => (float) $totalRetailPrice,
                'customer' => $customerData['name'] ?? 'Guest',
                'payment_method' => $paymentMethod
            ]);
        }
    }
}
