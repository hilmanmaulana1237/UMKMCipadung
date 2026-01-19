<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\AIGeneratedContent;

// Find generating posters
$generating = AIGeneratedContent::where('status', 'generating')
    ->orderBy('created_at', 'desc')
    ->get();

echo "Found " . $generating->count() . " generating poster(s)\n";

foreach ($generating as $p) {
    echo "\n--- Poster ---\n";
    echo "ID: " . $p->id . "\n";
    echo "Created: " . $p->created_at . "\n";
    echo "Result: " . $p->generated_result . "\n";
    
    // Check if task_id exists
    $data = json_decode($p->generated_result, true);
    if (isset($data['task_id'])) {
        echo "Task ID: " . $data['task_id'] . "\n";
        
        // Check with API
        $taskId = $data['task_id'];
        
        // Call KieAI to check status
        $apiKey = config('services.kie_ai.api_key');
        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
        ])->get("https://api.kie.ai/api/v1/jobs/{$taskId}");
        
        echo "API Response: " . json_encode($response->json()) . "\n";
        
        $apiData = $response->json();
        if (isset($apiData['data']['status']) && $apiData['data']['status'] === 'completed') {
            echo ">>> COMPLETED! Updating database...\n";
            $imageUrl = $apiData['data']['result'][0] ?? null;
            if ($imageUrl) {
                $p->status = 'completed';
                $p->generated_result = $imageUrl;
                $p->save();
                echo ">>> Updated to: " . $imageUrl . "\n";
            }
        }
    }
}

echo "\nDone!\n";
