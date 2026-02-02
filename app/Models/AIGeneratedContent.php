<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AIGeneratedContent extends Model
{
    use HasUuids;

    protected $table = 'ai_generated_contents';
    protected $fillable = ['user_id', 'type', 'prompt', 'original_image_path', 'generated_result', 'status'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
