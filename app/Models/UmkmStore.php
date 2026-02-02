<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class UmkmStore extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'category',
        'profile_photo_path',
        'slug',
        'description',
        'address_pickup',
        'latitude',
        'longitude',
        'contact_number',
        'bank_name',
        'bank_account',
        'bank_holder',
        'qris_path',
        'qris_handle',
        'banner_path',
        'store_photo_path',
        'is_open_today',
        'open_time',
        'close_time',
        'operating_days',
        'admin_fee',
    ];

    protected $casts = [
        'is_open_today' => 'boolean',
        'open_time' => 'datetime:H:i',
        'close_time' => 'datetime:H:i',
        'operating_days' => 'array',
        'admin_fee' => 'decimal:2',
    ];

    protected $appends = ['is_open'];

    /**
     * Get dynamic is_open status (time-aware).
     */
    public function getIsOpenAttribute(): bool
    {
        return $this->isOpen();
    }

    /**
     * Check if store is currently open.
     */
    public function isOpen(): bool
    {
        if (!$this->is_open_today) {
            return false;
        }

        $now = now();
        
        // If open/close times are set, check if current time is within range
        if ($this->open_time && $this->close_time) {
            try {
                $openStr = is_string($this->open_time) ? $this->open_time : $this->open_time->format('H:i');
                $closeStr = is_string($this->close_time) ? $this->close_time : $this->close_time->format('H:i');

                $openTime = $now->copy()->setTimeFromTimeString($openStr);
                $closeTime = $now->copy()->setTimeFromTimeString($closeStr);
                return $now->between($openTime, $closeTime);
            } catch (\Throwable $e) {
                return false; // Safely return closed if data invalid
            }
        }

        return true; // If no time set, just check is_open_today
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($store) {
            if (empty($store->slug)) {
                $store->slug = Str::slug($store->name);
            }
        });
    }

    /**
     * Get the owner of this store.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the products in this store.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get the orders for this store.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the reviews for this store.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(StoreReview::class);
    }

    /**
     * Get the star ratings for this store.
     */
    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class, 'target_id')
            ->where('target_type', 'store');
    }

    /**
     * Get the average star rating for this store.
     */
    public function getAverageRatingAttribute(): float
    {
        return round($this->ratings()->avg('stars') ?? 0, 1);
    }

    /**
     * Get the total number of star ratings for this store.
     */
    public function getTotalRatingsAttribute(): int
    {
        return $this->ratings()->count();
    }
}
