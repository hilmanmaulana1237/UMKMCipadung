<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Http\Controllers\AIContentController;
use App\Models\AIGeneratedContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

// Login as the user who owns the poster
$p = AIGeneratedContent::orderBy('updated_at', 'desc')->first();
$user = User::find($p->user_id);
Auth::login($user);

echo "Simulating request for user: " . $user->name . " (ID: " . $user->id . ")\n";
echo "Poster ID: " . $p->id . "\n";

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
    echo "Response Status: " . $response->getStatusCode() . "\n";
    echo "Body: " . $response->getContent() . "\n";
} catch (\Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
