<?php

return [
    /*
    |--------------------------------------------------------------------------
    | ToyyibPay Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for ToyyibPay payment gateway integration
    |
    */

    'sandbox' => env('TOYYIBPAY_SANDBOX', true),
    
    'user_secret_key' => env('TOYYIBPAY_USER_SECRET_KEY'),
    
    'category_code' => env('TOYYIBPAY_CATEGORY_CODE'),
    
    'base_url' => env('TOYYIBPAY_BASE_URL', 'https://dev.toyyibpay.com'),
    
    'api_endpoints' => [
        'create_category' => '/index.php/api/createCategory',
        'create_bill' => '/index.php/api/createBill',
        'get_bill_transactions' => '/index.php/api/getBillTransactions',
        'inactive_bill' => '/index.php/api/inactiveBill',
    ],
    
    'return_url' => env('APP_URL') . '/payment/return',
    'callback_url' => env('APP_URL') . '/payment/callback',
];