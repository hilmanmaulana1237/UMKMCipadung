<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\AIGeneratedContent;

// Mark all stuck generating posters as failed
$updated = AIGeneratedContent::where('status', 'generating')
    ->where('created_at', '<', now()->subMinutes(5))
    ->update([
        'status' => 'failed',
        'generated_result' => json_encode(['error' => 'Generation timeout - please try again'])
    ]);

echo "Marked {$updated} stuck poster(s) as failed.\n";
