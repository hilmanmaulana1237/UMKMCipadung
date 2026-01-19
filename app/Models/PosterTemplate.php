<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosterTemplate extends Model
{
    protected $fillable = [
        'name',
        'type',
        'image_path',
        'image_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = ['thumbnail_url'];

    public function getThumbnailUrlAttribute()
    {
        if ($this->image_url) {
            return $this->image_url;
        }

        if ($this->image_path) {
            return asset('storage/' . $this->image_path);
        }

        return null; // Or default placeholder
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
