<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = app(App\Services\PosterAIService::class);
$taskId = 'b05bddb6da8f634ffb5f88e7ea1e5766';
try {
    $result = $service->queryTaskStatus($taskId);
    print_r($result);
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
