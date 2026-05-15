<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$id = '9d37ba7969c8cae5e6b7e7098f5b86a4';
$responseGet = Illuminate\Support\Facades\Http::withHeaders(['Authorization' => 'Bearer ' . env('KIE_AI_API_KEY')])->get('https://api.kie.ai/api/v1/jobs/recordInfo', ['taskId' => $id]);
print_r($responseGet->json());
