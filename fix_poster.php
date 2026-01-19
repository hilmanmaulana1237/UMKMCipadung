<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\AIGeneratedContent;

$p = AIGeneratedContent::where('status', 'generating')
    ->orderBy('created_at', 'desc')
    ->first();

if (!$p) {
    echo "No generating poster found.\n";
    exit;
}

$data = json_decode($p->generated_result, true);
$taskId = $data['task_id'] ?? null;

echo "Poster ID: " . $p->id . "\n";
echo "Task ID: " . $taskId . "\n";
echo "Prompt: " . ($p->prompt ?? 'N/A') . "\n\n";

$apiKey = config('services.kie_ai.api_key');

// Use correct endpoint: /api/v1/jobs/recordInfo?taskId=xxx
$response = \Illuminate\Support\Facades\Http::withHeaders([
    'Authorization' => 'Bearer ' . $apiKey,
])->get("https://api.kie.ai/api/v1/jobs/recordInfo", [
    'taskId' => $taskId
]);

$json = $response->json();
echo "API Response:\n";
echo json_encode($json, JSON_PRETTY_PRINT) . "\n\n";

$state = $json['data']['state'] ?? 'unknown';
echo "State: " . $state . "\n";

if ($state === 'success') {
    // Parse resultJson
    $resultJson = json_decode($json['data']['resultJson'] ?? '{}', true);
    $imageUrl = $resultJson['resultUrls'][0] ?? null;
    
    if ($imageUrl) {
        echo "Image URL: " . $imageUrl . "\n";
        
        // Update poster
        $p->status = 'completed';
        $p->generated_result = $imageUrl;
        $p->save();
        echo ">>> FIXED! Poster updated.\n";
    }
} elseif ($state === 'fail') {
    $p->status = 'failed';
    $p->generated_result = json_encode(['error' => $json['data']['failMsg'] ?? 'Unknown error']);
    $p->save();
    echo ">>> Marked as failed.\n";
} else {
    echo "Still processing: " . $state . "\n";
}
