<?php
$contents = \App\Models\AIGeneratedContent::where('type', 'video_generation')
    ->latest()
    ->take(5)
    ->get();

foreach ($contents as $c) {
    echo "ID: {$c->id} | Status: {$c->status} | Created: {$c->created_at}\n";
    echo "Result Quote: " . substr($c->generated_result, 0, 100) . "...\n";
    echo "-------------------\n";
}
