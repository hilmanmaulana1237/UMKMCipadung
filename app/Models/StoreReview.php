<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreReview extends Model
{
    protected $fillable = [
        'umkm_store_id',
        'user_id',
        'order_id',
        'sentiment',
        'comment',
    ];

    protected $casts = [
        'sentiment' => 'string',
    ];

    /**
     * Get the user who wrote this review.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the order this review is for.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the store this review is for.
     */
    public function store()
    {
        return $this->belongsTo(UmkmStore::class, 'umkm_store_id');
    }
}
