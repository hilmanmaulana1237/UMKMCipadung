<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rating extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'target_type',
        'target_id',
        'stars',
        'comment',
    ];

    protected $casts = [
        'stars' => 'integer',
    ];

    /**
     * Get the order this rating belongs to.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user who made this rating.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the courier being rated (if target_type is 'courier').
     */
    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_id');
    }

    /**
     * Get the store being rated (if target_type is 'store').
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(UmkmStore::class, 'target_id');
    }

    /**
     * Scope to get courier ratings only.
     */
    public function scopeForCourier($query)
    {
        return $query->where('target_type', 'courier');
    }

    /**
     * Scope to get store ratings only.
     */
    public function scopeForStore($query)
    {
        return $query->where('target_type', 'store');
    }

    /**
     * Scope to get ratings for a specific target.
     */
    public function scopeForTarget($query, string $type, int $id)
    {
        return $query->where('target_type', $type)->where('target_id', $id);
    }
}
