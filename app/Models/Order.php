<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    /**
     * Fixed courier commission amount in Rupiah.
     */
    public const COURIER_COMMISSION_AMOUNT = 3000;

    protected $fillable = [
        'order_number',
        'buyer_id',
        'umkm_store_id',
        'courier_id',
        'promo_code_used',
        'status',
        'courier_status',
        'total_amount',
        'courier_fee',
        'shipping_discount',
        'payment_proof_path',
        'shipping_address',
        'shipping_lat',
        'shipping_lng',
        'cancelled_at',
        'cancellation_code',
        'cancelled_by',
        'is_digital_order',
        'courier_accepted_at',
        'courier_last_activity_at',
        'admin_fee',
        'admin_fee_status',
        'store_fee',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'courier_fee' => 'decimal:2',
        'store_fee' => 'decimal:2',
        'shipping_lat' => 'decimal:8',
        'shipping_lng' => 'decimal:8',
        'cancelled_at' => 'datetime',
        'is_digital_order' => 'boolean',
        'courier_accepted_at' => 'datetime',
        'courier_last_activity_at' => 'datetime',
    ];

    /**
     * Generate unique order number.
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'INV-';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -5));
        return $prefix . $date . '-' . $random;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = self::generateOrderNumber();
            }
        });
    }

    /**
     * Get the buyer of this order.
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * Get the store this order belongs to.
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(UmkmStore::class, 'umkm_store_id');
    }

    /**
     * Get the courier assigned to this order.
     */
    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_id');
    }

    /**
     * Get the order items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the affiliate reward for this order.
     */
    public function affiliateReward(): HasOne
    {
        return $this->hasOne(AffiliateReward::class);
    }

    /**
     * Check if order is pending payment.
     */
    public function isPendingPayment(): bool
    {
        return $this->status === 'pending_payment';
    }

    /**
     * Check if order is waiting for verification.
     */
    public function isWaitingVerification(): bool
    {
        return $this->status === 'waiting_verification';
    }

    /**
     * Check if order is ready to ship.
     */
    public function isReadyToShip(): bool
    {
        return $this->status === 'ready_to_ship';
    }

    /**
     * Check if order is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Get the review for this order.
     */
    public function review(): HasOne
    {
        return $this->hasOne(StoreReview::class);
    }
}
