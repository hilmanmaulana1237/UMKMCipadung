<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageService
{
    protected $manager;

    public function __construct()
    {
        // Initialize Intervention Image with GD Driver
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * Upload, Resize, and Compress Image
     *
     * @param UploadedFile $file The uploaded file
     * @param string $path Directory path (e.g., 'products', 'stores')
     * @param int|null $maxWidth Maximum width (default: 1200)
     * @param int $quality Compression quality (0-100, default: 80)
     * @return string The stored file path
     */
    public function upload(UploadedFile $file, string $path, ?int $maxWidth = 1200, int $quality = 80): string
    {
        // Create unique filename
        $filename = uniqid() . '_' . time() . '.webp';
        $fullPath = $path . '/' . $filename;

        // Read image
        $image = $this->manager->read($file);

        // Resize if wider than maxWidth
        if ($maxWidth && $image->width() > $maxWidth) {
            $image->scale(width: $maxWidth);
        }

        // Encode to WebP with compression
        $encoded = $image->toWebp($quality);

        // Save to Storage (Public Disk)
        Storage::disk('public')->put($fullPath, (string) $encoded);

        return $fullPath;
    }
}
