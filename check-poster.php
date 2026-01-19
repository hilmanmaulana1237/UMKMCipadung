<?php
$p = \App\Models\AIGeneratedContent::where('type', 'poster')->latest()->first();
echo "ID: " . $p->id . "\n";
echo "Status: " . $p->status . "\n";
echo "External TaskId: " . ($p->external_task_id ?? 'NULL') . "\n";
echo "Generated Result: " . ($p->generated_result ?? 'NULL') . "\n";
