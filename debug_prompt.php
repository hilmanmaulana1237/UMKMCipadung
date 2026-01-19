<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\AIGeneratedContent;

$p = AIGeneratedContent::orderBy('updated_at', 'desc')->first();

echo "ID: " . $p->id . "\n";
echo "Type: " . gettype($p->prompt) . "\n";
echo "Prompt Value: " . ($p->prompt ?? 'NULL') . "\n";

// Coba decode
$decoded = json_decode($p->prompt, true);
echo "Decoded: " . json_encode($decoded) . "\n";
