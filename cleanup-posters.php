<?php

// Update old stuck posters
$updated = \App\Models\AIGeneratedContent::where('type', 'poster')
    ->where('status', 'generating')
    ->update(['status' => 'failed', 'generated_result' => json_encode(['error' => 'Timeout/Stuck'])]);

echo "Updated $updated stuck posters to failed.\n";

// Show current list
$posters = \App\Models\AIGeneratedContent::where('type', 'poster')->orderBy('created_at', 'desc')->take(5)->get();
foreach ($posters as $p) {
    echo $p->created_at . " | " . $p->status . " | " . $p->id . "\n";
}
