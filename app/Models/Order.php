<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_id',
        'product_ids',
        'quantities',
        'customer_data',
        'state',
        'payment_method',
        'total_cost_price',
        'total_retail_price',
        'payment_status',
        'toyyibpay_bill_code',
        'toyyibpay_bill_url',
        'toyyibpay_reference_no',
        'toyyibpay_callback_data',
        'meta_pixel_purchase_sent',
        'meta_pixel_purchase_sent_at',
        'paid_at',
    ];

    protected $casts = [
        'product_ids' => 'array',
        'quantities' => 'array',
        'customer_data' => 'array',
        'toyyibpay_callback_data' => 'array',
        'total_cost_price' => 'decimal:2',
        'total_retail_price' => 'decimal:2',
        'meta_pixel_purchase_sent' => 'boolean',
        'meta_pixel_purchase_sent_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }

    public function scopeSuccess($query)
    {
        return $query->where('payment_status', 'success');
    }

    public function scopeFailed($query)
    {
        return $query->where('payment_status', 'failed');
    }

    public function isPending()
    {
        return $this->payment_status === 'pending';
    }

    public function isSuccess()
    {
        return $this->payment_status === 'success';
    }

    public function isFailed()
    {
        return $this->payment_status === 'failed';
    }
}
