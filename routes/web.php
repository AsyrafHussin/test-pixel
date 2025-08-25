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

// Dashboard Routes
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');
Route::post('/dashboard/login', [DashboardController::class, 'login'])->name('dashboard.login');
