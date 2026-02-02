<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AIChatMessage extends Model
{
    use HasUuids;

    protected $table = 'ai_chat_messages';
    protected $fillable = ['session_id', 'role', 'content'];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AIChatSession::class, 'session_id');
    }
}
