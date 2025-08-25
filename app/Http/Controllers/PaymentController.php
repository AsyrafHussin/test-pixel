<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Services\ToyyibPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Combindma\FacebookPixel\Facades\MetaPixel;

class PaymentController extends Controller
{
    private $toyyibPayService;

    public function __construct(ToyyibPayService $toyyibPayService)
    {
        $this->toyyibPayService = $toyyibPayService;
    }

    /**
     * Handle callback from ToyyibPay (POST)
     * This is called by ToyyibPay server when payment status changes
     */
    public function callback(Request $request)
    {
        try {
            $callbackData = $request->all();
            Log::info('ToyyibPay Callback Received', $callbackData);

            // Verify callback (add additional security if needed)
            $this->toyyibPayService->verifyCallback($callbackData);

            // Find order by external reference number (order_id)
            $order = Order::where('order_id', $callbackData['order_id'])->first();

            if (!$order) {
                Log::error('Order not found for callback', ['order_id' => $callbackData['order_id']]);
                return response('Order not found', 404);
            }

            // Update order based on payment status
            $paymentStatus = $this->mapToyyibPayStatus($callbackData['status']);
            
            $order->update([
                'payment_status' => $paymentStatus,
                'toyyibpay_reference_no' => $callbackData['refno'],
                'toyyibpay_callback_data' => $callbackData,
                'paid_at' => $paymentStatus === 'success' ? now() : null,
            ]);

            // Send Meta Pixel Purchase event only if payment is successful AND not already sent
            if ($paymentStatus === 'success' && !$order->meta_pixel_purchase_sent) {
                $this->sendMetaPixelPurchaseEvent($order);
            }

            Log::info('Order payment status updated', [
                'order_id' => $order->order_id,
                'status' => $paymentStatus,
                'reference_no' => $callbackData['refno']
            ]);

            return response('OK', 200);
        } catch (\Exception $e) {
            Log::error('ToyyibPay Callback Error', [
                'error' => $e->getMessage(),
                'callback_data' => $request->all()
            ]);

            return response('Error', 500);
        }
    }

    /**
     * Handle return from ToyyibPay (GET)
     * This is where user is redirected after payment
     */
    public function return(Request $request)
    {
        try {
            $returnData = $request->all();
            Log::info('ToyyibPay Return Received', $returnData);

            // Find order by external reference number (order_id)
            $order = Order::where('order_id', $returnData['order_id'])->first();

            if (!$order) {
                return redirect('/')->with('error', 'Order not found');
            }

            // Update order status based on return data
            $paymentStatus = $this->mapToyyibPayStatus($returnData['status_id']);
            
            // Only update if status is different (callback should have already updated it)
            // Note: Meta Pixel events are sent via callback only, not here
            if ($order->payment_status !== $paymentStatus) {
                $order->update([
                    'payment_status' => $paymentStatus,
                    'paid_at' => $paymentStatus === 'success' ? now() : null,
                ]);
                
                Log::info('Order status updated via return (callback missed)', [
                    'order_id' => $order->order_id,
                    'status' => $paymentStatus
                ]);
            }

            // Prepare success/failure message
            if ($paymentStatus === 'success') {
                $successData = [
                    'message' => 'Payment successful! Order ID: ' . $order->order_id,
                    'order_id' => $order->order_id,
                    'total_cost_price' => (float) $order->total_cost_price,
                    'total_retail_price' => (float) $order->total_retail_price,
                    'customer' => $order->customer_data['name'] ?? 'Guest',
                    'payment_method' => $order->payment_method
                ];

                return redirect('/')->with('success', $successData);
            } else {
                return redirect('/')->with('error', 'Payment failed or cancelled. Please try again.');
            }
        } catch (\Exception $e) {
            Log::error('ToyyibPay Return Error', [
                'error' => $e->getMessage(),
                'return_data' => $request->all()
            ]);

            return redirect('/')->with('error', 'An error occurred processing your payment return.');
        }
    }

    /**
     * Map ToyyibPay status codes to our internal status
     */
    private function mapToyyibPayStatus($statusId)
    {
        switch ($statusId) {
            case '1':
                return 'success';
            case '2':
                return 'pending';
            case '3':
                return 'failed';
            default:
                return 'failed';
        }
    }

    /**
     * Send Meta Pixel Purchase event for successful FPX payments
     */
    private function sendMetaPixelPurchaseEvent($order)
    {
        try {
            // Get products from order
            $products = Product::whereIn('id', $order->product_ids)->get();
            
            $orderItems = [];
            foreach ($products as $product) {
                $quantity = $order->quantities[$product->id] ?? 1;
                $orderItems[] = [
                    'id' => $product->sku,
                    'quantity' => $quantity,
                    'price' => $product->cost_price // COST price for Meta Pixel
                ];
            }

            // Send Meta Pixel Purchase event with COST PRICE
            MetaPixel::track('Purchase', [
                'currency' => 'MYR',
                'value' => (float) $order->total_cost_price, // Send COST price, not retail
                'content_ids' => $products->pluck('sku')->toArray(),
                'content_type' => 'product',
                'num_items' => array_sum($order->quantities),
                'contents' => $orderItems
            ], $order->order_id); // Use order ID for deduplication

            // Mark as sent to prevent duplicates
            $order->update([
                'meta_pixel_purchase_sent' => true,
                'meta_pixel_purchase_sent_at' => now(),
            ]);

            Log::info('Meta Pixel Purchase event sent for FPX payment', [
                'order_id' => $order->order_id,
                'value' => $order->total_cost_price
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send Meta Pixel Purchase event', [
                'order_id' => $order->order_id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
