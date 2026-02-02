<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'type',
        'description',
        'status',
        'admin_response',
    ];

    /**
     * Get the user who made the complaint.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the order related to the complaint.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get type label in Indonesian.
     */
    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'product_quality' => 'Kualitas Produk',
            'delivery' => 'Pengiriman',
            'seller' => 'Penjual',
            'courier' => 'Kurir',
            'other' => 'Lainnya',
            default => $this->type,
        };
    }

    /**
     * Get status label in Indonesian.
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Menunggu',
            'in_review' => 'Sedang Ditinjau',
            'resolved' => 'Selesai',
            'rejected' => 'Ditolak',
            default => $this->status,
        };
    }
}
