<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$c = App\Models\AIGeneratedContent::where('type', 'poster')->latest()->first();
if ($c) {
    echo "Updating task " . $c->id . "...\n";
    $c->status = 'completed';
    // Use the URL found in debug
    $c->generated_result = 'https://tempfileb.aiquickdraw.com/kieai/market/1768735338843-9ei5pcbctkd.jpeg'; 
    $c->save();
    echo "Task updated successfully to COMPLETED.\n";
} else {
    echo "No poster task found.\n";
}
