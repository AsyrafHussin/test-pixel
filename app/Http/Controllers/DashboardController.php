<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Simple authentication check (you can enhance this later)
        $password = $request->query('password', '');
        if ($password !== 'admin123') {
            return $this->loginForm();
        }

        $orders = Order::orderBy('created_at', 'desc')
            ->paginate(20);
        
        // Get all product IDs from orders and load products
        $allProductIds = [];
        foreach ($orders as $order) {
            $allProductIds = array_merge($allProductIds, $order->product_ids ?? []);
        }
        $allProductIds = array_unique($allProductIds);
        
        $products = \App\Models\Product::whereIn('id', $allProductIds)->get()->keyBy('id');
        
        // Attach products to orders
        foreach ($orders as $order) {
            $orderProducts = [];
            if ($order->product_ids) {
                foreach ($order->product_ids as $productId) {
                    if (isset($products[$productId])) {
                        $orderProducts[] = [
                            'product' => $products[$productId],
                            'quantity' => $order->quantities[$productId] ?? 1
                        ];
                    }
                }
            }
            $order->order_products = $orderProducts;
        }

        return Inertia::render('Dashboard', [
            'orders' => $orders,
            'stats' => [
                'total_orders' => Order::count(),
                'successful_orders' => Order::success()->count(),
                'pending_orders' => Order::pending()->count(),
                'failed_orders' => Order::failed()->count(),
                'total_revenue' => Order::success()->sum('total_retail_price'),
            ]
        ]);
    }

    public function login(Request $request)
    {
        $password = $request->input('password', '');
        if ($password === 'admin123') {
            return redirect('/dashboard?password=admin123');
        }

        return $this->loginForm('Invalid password');
    }

    private function loginForm($error = null)
    {
        return Inertia::render('Login', [
            'error' => $error
        ]);
    }
}
