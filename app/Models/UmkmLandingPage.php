<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class UmkmLandingPage extends Model
{
    protected $fillable = [
        'umkm_store_id',
        'slug',
        'template',
        'hero_image_path',
        'tagline',
        'description',
        'feature1_title',
        'feature1_desc',
        'feature2_title',
        'feature2_desc',
        'feature3_title',
        'feature3_desc',
        'business_phone',
        'business_address',
        'business_hours',
        'instagram',
        'email',
        'products',
        'is_published',
    ];

    protected $casts = [
        'products' => 'array',
        'is_published' => 'boolean',
    ];

    protected $appends = ['public_url', 'hero_image_url'];

    /**
     * Relationship: Landing page belongs to a store
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(UmkmStore::class, 'umkm_store_id');
    }

    /**
     * Generate unique slug from store name
     */
    public static function generateSlug(string $storeName): string
    {
        $baseSlug = Str::slug($storeName);
        $slug = $baseSlug;
        $counter = 1;

        while (self::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Get public URL
     */
    public function getPublicUrlAttribute(): string
    {
        return url('/toko/' . $this->slug);
    }

    /**
     * Get hero image URL
     */
    public function getHeroImageUrlAttribute(): ?string
    {
        if (!$this->hero_image_path) {
            return null;
        }
        return asset('storage/' . $this->hero_image_path);
    }

    /**
     * Template metadata
     */
    public static function getTemplates(): array
    {
        return [
            'tema1' => [
                'name' => 'Luxury Dark',
                'description' => 'Tema elegan dengan warna emas dan hitam. Cocok untuk makanan premium atau restoran.',
                'preview' => '/storage/tema-landingpage/previews/tema1.png',
                'category' => 'food',
            ],
            'tema2' => [
                'name' => 'Cute Pastel',
                'description' => 'Tema lucu dengan warna pink pastel. Cocok untuk dessert, snack, atau produk anak.',
                'preview' => '/storage/tema-landingpage/previews/tema2.png',
                'category' => 'food',
            ],
            'tema3' => [
                'name' => 'Minimalist Catalog',
                'description' => 'Tema minimalis hitam-putih. Cocok untuk fashion, aksesoris, atau katalog produk.',
                'preview' => '/storage/tema-landingpage/previews/tema3.png',
                'category' => 'fashion',
            ],
            'tema4' => [
                'name' => 'Traditional Warm',
                'description' => 'Tema hangat dengan warna oranye. Cocok untuk oleh-oleh, keripik, atau UMKM tradisional.',
                'preview' => '/storage/tema-landingpage/previews/tema4.png',
                'category' => 'food',
            ],
            'tema5' => [
                'name' => 'Professional Blue',
                'description' => 'Tema profesional dengan warna biru. Cocok untuk jasa, laundry, atau layanan.',
                'preview' => '/storage/tema-landingpage/previews/tema5.png',
                'category' => 'service',
            ],
        ];
    }
}
