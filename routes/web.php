<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', [ProductController::class, 'index'])->name('products.index');
Route::post('/purchase', [ProductController::class, 'purchase'])->name('products.purchase');

// ToyyibPay Payment Routes
Route::post('/payment/callback', [PaymentController::class, 'callback'])->name('payment.callback');
Route::get('/payment/return', [PaymentController::class, 'return'])->name('payment.return');

// Test endpoint to verify callback connectivity
Route::any('/payment/test', function (Illuminate\Http\Request $request) {
    \Illuminate\Support\Facades\Log::info('Payment Test Endpoint Hit', [
        'method' => $request->method(),
        'data' => $request->all(),
        'headers' => $request->headers->all(),
        'ip' => $request->ip()
    ]);
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
})->name('payment.test');

// Dashboard Routes
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');
Route::post('/dashboard/login', [DashboardController::class, 'login'])->name('dashboard.login');
