<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ToyyibPayService
{
    private $baseUrl;
    private $userSecretKey;
    private $categoryCode;

    public function __construct()
    {
        $this->baseUrl = config('toyyibpay.base_url');
        $this->userSecretKey = config('toyyibpay.user_secret_key');
        $this->categoryCode = config('toyyibpay.category_code');
    }

    /**
     * Create a new category (run this once to get category code)
     */
    public function createCategory($categoryName, $categoryDescription)
    {
        try {
            $response = Http::asForm()->post($this->baseUrl . config('toyyibpay.api_endpoints.create_category'), [
                'catname' => $categoryName,
                'catdescription' => $categoryDescription,
                'userSecretKey' => $this->userSecretKey,
            ]);

            $result = $response->json();
            
            if ($response->successful() && !empty($result)) {
                Log::info('ToyyibPay Category Created', ['response' => $result]);
                return $result[0]['CategoryCode'] ?? null;
            }

            throw new Exception('Failed to create category: ' . $response->body());
        } catch (Exception $e) {
            Log::error('ToyyibPay Create Category Error', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Create a bill for payment
     */
    public function createBill($orderData)
    {
        try {
            $billData = [
                'userSecretKey' => $this->userSecretKey,
                'categoryCode' => $this->categoryCode,
                'billName' => substr('Order_' . $orderData['order_id'], 0, 30), // Max 30 chars
                'billDescription' => substr('Payment for Order ' . $orderData['order_id'], 0, 100), // Max 100 chars
                'billPriceSetting' => 1, // Fixed amount
                'billPayorInfo' => 1, // Require payer information
                'billAmount' => $orderData['total_retail_price'] * 100, // Convert to cents
                'billReturnUrl' => config('toyyibpay.return_url'),
                'billCallbackUrl' => config('toyyibpay.callback_url'),
                'billExternalReferenceNo' => $orderData['order_id'],
                'billTo' => $orderData['customer_data']['name'],
                'billEmail' => $orderData['customer_data']['email'],
                'billPhone' => $orderData['customer_data']['phone'],
                'billSplitPayment' => 0,
                'billSplitPaymentArgs' => '',
                'billPaymentChannel' => '0', // FPX only
                'billContentEmail' => 'Thank you for your purchase!',
                'billChargeToCustomer' => 1,
                'billExpiryDays' => 3,
            ];

            $response = Http::asForm()->post($this->baseUrl . config('toyyibpay.api_endpoints.create_bill'), $billData);

            $result = $response->json();
            
            if ($response->successful() && !empty($result)) {
                $billCode = $result[0]['BillCode'] ?? null;
                if ($billCode) {
                    Log::info('ToyyibPay Bill Created', ['bill_code' => $billCode, 'order_id' => $orderData['order_id']]);
                    return [
                        'bill_code' => $billCode,
                        'bill_url' => $this->baseUrl . '/' . $billCode,
                    ];
                }
            }

            throw new Exception('Failed to create bill: ' . $response->body());
        } catch (Exception $e) {
            Log::error('ToyyibPay Create Bill Error', ['error' => $e->getMessage(), 'order_id' => $orderData['order_id']]);
            throw $e;
        }
    }

    /**
     * Get bill transaction status
     */
    public function getBillTransactions($billCode, $status = null)
    {
        try {
            $data = [
                'billCode' => $billCode,
            ];

            if ($status) {
                $data['billpaymentStatus'] = $status;
            }

            $response = Http::asForm()->post($this->baseUrl . config('toyyibpay.api_endpoints.get_bill_transactions'), $data);

            $result = $response->json();
            
            if ($response->successful()) {
                Log::info('ToyyibPay Transaction Status Retrieved', ['bill_code' => $billCode, 'result' => $result]);
                return $result;
            }

            throw new Exception('Failed to get bill transactions: ' . $response->body());
        } catch (Exception $e) {
            Log::error('ToyyibPay Get Transaction Error', ['error' => $e->getMessage(), 'bill_code' => $billCode]);
            throw $e;
        }
    }

    /**
     * Inactive a bill
     */
    public function inactiveBill($billCode)
    {
        try {
            $response = Http::asForm()->post($this->baseUrl . config('toyyibpay.api_endpoints.inactive_bill'), [
                'secretKey' => $this->userSecretKey,
                'billCode' => $billCode,
            ]);

            $result = $response->json();
            
            if ($response->successful()) {
                Log::info('ToyyibPay Bill Inactivated', ['bill_code' => $billCode, 'result' => $result]);
                return $result;
            }

            throw new Exception('Failed to inactive bill: ' . $response->body());
        } catch (Exception $e) {
            Log::error('ToyyibPay Inactive Bill Error', ['error' => $e->getMessage(), 'bill_code' => $billCode]);
            throw $e;
        }
    }

    /**
     * Verify callback data
     */
    public function verifyCallback($callbackData)
    {
        // Additional verification can be added here if needed
        // For now, we'll just log the callback data
        Log::info('ToyyibPay Callback Received', $callbackData);
        
        return true;
    }
}