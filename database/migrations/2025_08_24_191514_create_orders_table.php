<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->unique();
            $table->json('product_ids');
            $table->json('quantities');
            $table->json('customer_data');
            $table->string('state')->nullable();
            $table->string('payment_method');
            $table->decimal('total_cost_price', 10, 2);
            $table->decimal('total_retail_price', 10, 2);
            $table->string('payment_status')->default('pending'); // pending, success, failed, cancelled
            $table->string('toyyibpay_bill_code')->nullable();
            $table->string('toyyibpay_bill_url')->nullable();
            $table->string('toyyibpay_reference_no')->nullable();
            $table->text('toyyibpay_callback_data')->nullable();
            $table->boolean('meta_pixel_purchase_sent')->default(false);
            $table->timestamp('meta_pixel_purchase_sent_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
