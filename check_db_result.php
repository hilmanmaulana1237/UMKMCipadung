<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\AIGeneratedContent;

$p = AIGeneratedContent::orderBy('updated_at', 'desc')->first();

echo "ID: " . $p->id . "\n";
echo "Result raw: " . $p->generated_result . "\n";

$data = json_decode($p->generated_result, true);
if (json_last_error() === JSON_ERROR_NONE) {
    echo "Is JSON: YES\n";
    echo "Copywriting field: " . ($data['copywriting'] ?? 'MISSING') . "\n";
} else {
    echo "Is JSON: NO\n";
}
