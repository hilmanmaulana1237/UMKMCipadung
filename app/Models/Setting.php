<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'description'];

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("setting.{$key}", 60, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();
            return $setting?->value ?? $default;
        });
    }

    /**
     * Set a setting value.
     */
    public static function set(string $key, mixed $value, ?string $description = null): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'description' => $description]
        );
        
        Cache::forget("setting.{$key}");
    }

    /**
     * Check if maintenance mode is active.
     */
    public static function isMaintenanceMode(): bool
    {
        return self::get('maintenance_mode', 'false') === 'true';
    }

    /**
     * Toggle maintenance mode.
     */
    public static function toggleMaintenanceMode(): bool
    {
        $current = self::isMaintenanceMode();
        self::set('maintenance_mode', $current ? 'false' : 'true', 'Application maintenance mode');
        return !$current;
    }
}
