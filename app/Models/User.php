ww<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'wa_number',
        'avatar_path',
        'affiliate_code',
        'role',
        'is_courier_active',
        'current_lat',
        'current_lng',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'wallet_balance' => 'decimal:2',
            'is_courier_active' => 'boolean',
            'current_lat' => 'decimal:8',
            'current_lng' => 'decimal:8',
        ];
    }

    /**
     * Get the UMKM store owned by this user.
     */
    public function umkmStore(): HasOne
    {
        return $this->hasOne(UmkmStore::class);
    }

    /**
     * Get the orders made by this user as a buyer.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    /**
     * Get the deliveries handled by this user as a courier.
     */
    public function deliveries(): HasMany
    {
        return $this->hasMany(Order::class, 'courier_id');
    }

    /**
     * Get the affiliate rewards earned by this user.
     */
    public function affiliateRewards(): HasMany
    {
        return $this->hasMany(AffiliateReward::class, 'affiliate_id');
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is a buyer.
     */
    public function isBuyer(): bool
    {
        return $this->hasRole('buyer');
    }

    /**
     * Check if user is a UMKM (seller).
     */
    public function isUmkm(): bool
    {
        return $this->hasRole('umkm');
    }

    /**
     * Check if user is a courier.
     */
    public function isCourier(): bool
    {
        return $this->hasRole('courier');
    }

    /**
     * Check if user is an affiliator.
     */
    public function isAffiliator(): bool
    {
        return $this->hasRole('affiliator');
    }

    /**
     * Get the ratings received by this user as a courier.
     */
    public function courierRatings(): HasMany
    {
        return $this->hasMany(Rating::class, 'target_id')
            ->where('target_type', 'courier');
    }

    /**
     * Get the average rating for this courier.
     */
    public function getCourierAverageRatingAttribute(): float
    {
        return round($this->courierRatings()->avg('stars') ?? 0, 1);
    }

    /**
     * Get the total number of ratings for this courier.
     */
    public function getCourierTotalRatingsAttribute(): int
    {
        return $this->courierRatings()->count();
    }
}

