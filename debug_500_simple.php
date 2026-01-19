<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Http\Controllers\AIContentController;
use App\Models\AIGeneratedContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

$p = AIGeneratedContent::orderBy('updated_at', 'desc')->first();
$user = $p->user;
Auth::login($user);

$request = Request::create('/umkm/ai-content/generate-poster-copywriting', 'POST', [
    'content_id' => $p->id,
    'store_name' => 'RajaDimsum',
    'product_name' => 'Dimsum',
    'price' => 'Rp 15.000',
    'slogan' => 'Enak, Murah, Nagih!',
    'phone' => '083197008165',
    'address' => 'Jl. Cipadung',
]);

$controller = app(AIContentController::class);

try {
    $response = $controller->generatePosterCopywriting($request);
    echo "SUCCESS: " . $response->getStatusCode() . "\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "File: " . $e->getFile() . "\n";
}
