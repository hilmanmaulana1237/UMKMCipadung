<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$url = 'https://tempfile.aiquickdraw.com/images/1768735338843-9ei5pcbctkd.jpeg';
echo "Downloading $url...\n";

try {
    $content = file_get_contents($url);
    if ($content === false) {
        throw new Exception("Failed to download image");
    }

    $c = App\Models\AIGeneratedContent::where('type', 'poster')->latest()->first();
    if ($c) {
        $filename = "generated-posters/" . $c->user_id . "_" . time() . ".jpeg";
        Storage::disk('public')->put($filename, $content);
        
        $localUrl = asset('storage/' . $filename);
        $c->generated_result = $localUrl;
        $c->save();
        
        echo "Image saved to: $filename\n";
        echo "DB updated with: $localUrl\n";
    } else {
        echo "No task found.\n";
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
