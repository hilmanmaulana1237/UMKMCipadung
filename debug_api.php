<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\AIGeneratedContent;

$p = AIGeneratedContent::where('status', 'generating')
    ->orderBy('created_at', 'desc')
    ->first();

$data = json_decode($p->generated_result, true);
$taskId = $data['task_id'] ?? null;

$apiKey = config('services.kie_ai.api_key');
$response = \Illuminate\Support\Facades\Http::withHeaders([
    'Authorization' => 'Bearer ' . $apiKey,
])->get("https://api.kie.ai/api/v1/jobs/{$taskId}");

$json = $response->json();
file_put_contents('api_response.json', json_encode($json, JSON_PRETTY_PRINT));
echo "Saved to api_response.json\n";
echo "Status Code: " . $response->status() . "\n";
