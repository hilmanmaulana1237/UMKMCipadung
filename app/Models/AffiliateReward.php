<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AffiliateReward extends Model
{
    use HasFactory;

    /**
     * Fixed commission amount in Rupiah.
     */
    public const COMMISSION_AMOUNT = 1000;

    protected $fillable = [
        'affiliate_id',
        'order_id',
        'amount',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Get the affiliator who earned this reward.
     */
    public function affiliator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'affiliate_id');
    }

    /**
     * Get the order associated with this reward.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Check if reward is still potential (order not verified).
     */
    public function isPotential(): bool
    {
        return $this->status === 'potential';
    }

    /**
     * Check if reward is verified (order verified by UMKM).
     */
    public function isVerified(): bool
    {
        return $this->status === 'verified';
    }

    /**
     * Check if reward is paid (order completed).
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    /**
     * Mark as verified (called when UMKM verifies order).
     */
    public function markAsVerified(): void
    {
        $this->update(['status' => 'verified']);
    }

    /**
     * Mark as paid and add to affiliator's wallet (called when order completed).
     */
    public function markAsPaid(): void
    {
        $this->update(['status' => 'paid']);
        $this->affiliator->increment('wallet_balance', $this->amount);
    }
}
