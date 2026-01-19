<?php

// Mark all generating posters as failed
\App\Models\AIGeneratedContent::where('type', 'poster')
    ->where('status', 'generating')
    ->update(['status' => 'failed']);

echo "Done - marked generating posters as failed.\n";

// List current posters
$posters = \App\Models\AIGeneratedContent::whereIn('type', ['poster', 'poster_generation'])->get();
foreach ($posters as $p) {
    echo "ID: " . $p->id . " | Status: " . $p->status . " | Type: " . $p->type . "\n";
}
