<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;

class ApiSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'model',
        'provider',
        'base_url',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Encrypt the API key before saving
     */
    public function setValueAttribute($value)
    {
        if ($value) {
            $this->attributes['value'] = Crypt::encryptString($value);
        } else {
            $this->attributes['value'] = null;
        }
    }

    /**
     * Decrypt the API key when retrieving
     */
    public function getDecryptedValueAttribute(): ?string
    {
        if (!$this->attributes['value']) {
            return null;
        }

        try {
            return Crypt::decryptString($this->attributes['value']);
        } catch (DecryptException $e) {
            return null;
        }
    }

    /**
     * Get masked API key for display (e.g., sk-••••••••1234)
     */
    public function getMaskedValueAttribute(): ?string
    {
        $decrypted = $this->decrypted_value;
        if (!$decrypted) {
            return null;
        }

        $length = strlen($decrypted);
        if ($length <= 8) {
            return str_repeat('•', $length);
        }

        $prefix = substr($decrypted, 0, 4);
        $suffix = substr($decrypted, -4);
        $middle = str_repeat('•', min($length - 8, 12));

        return $prefix . $middle . $suffix;
    }

    /**
     * Check if API key is configured
     */
    public function getIsConfiguredAttribute(): bool
    {
        return !empty($this->attributes['value']);
    }

    /**
     * Get Primary API setting
     */
    public static function getPrimary(): ?self
    {
        return self::where('key', 'api_primary')->first();
    }

    /**
     * Get Secondary API setting
     */
    public static function getSecondary(): ?self
    {
        return self::where('key', 'api_secondary')->first();
    }

    /**
     * Get Video API setting
     */
    public static function getVideo(): ?self
    {
        return self::where('key', 'api_video')->first();
    }

    /**
     * Get API key for a specific tier, with fallback
     * @param string $tier 'primary', 'secondary', 'video'
     * @return array ['api_key' => string|null, 'model' => string|null, 'base_url' => string|null]
     */
    public static function getConfig(string $tier = 'primary'): array
    {
        $setting = self::where('key', 'api_' . $tier)
            ->where('is_active', true)
            ->first();

        // Fallback to primary if requested tier not found (EXCEPT for video)
        if (!$setting && $tier !== 'primary' && $tier !== 'video') {
            $setting = self::getPrimary();
        }

        // Special case for Video: Return specific defaults or empty if not configured
        if ($tier === 'video') {
            if (!$setting || !$setting->is_configured) {
                // FALLBACK TO ENV (New Logic)
                $envKey = config('services.kie_ai.api_key');
                if ($envKey) {
                    return [
                        'api_key' => $envKey,
                        'model' => config('services.kie_ai.model', 'sora-2-image-to-video'),
                        'base_url' => config('services.kie_ai.base_url', 'https://api.kie.ai/api/v1/jobs'),
                        'provider' => 'kie-ai',
                    ];
                }

                return [
                    'api_key' => '', // Empty key ensures failure if not set
                    'model' => 'sora-2-image-to-video',
                    'base_url' => 'https://api.kie.ai/api/v1/jobs',
                    'provider' => 'kie-ai',
                ];
            }
        }

        // Fallback to ENV if database not configured (General Chat Only)
        if (!$setting || !$setting->is_configured) {
            return [
                'api_key' => config('services.openrouter.api_key', ''),
                'model' => config('services.openrouter.model', 'deepseek/deepseek-r1-0528:free'),
                'base_url' => 'https://openrouter.ai/api/v1/chat/completions',
                'provider' => 'openrouter',
            ];
        }

        return [
            'api_key' => $setting->decrypted_value,
            'model' => $setting->model,
            'base_url' => $setting->base_url ?: 'https://openrouter.ai/api/v1/chat/completions',
            'provider' => $setting->provider,
        ];
    }
}
