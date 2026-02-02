<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;

try {
    $jasaProduct = Product::where('category', 'jasa')->with('store.owner')->first();

    if ($jasaProduct) {
        $store = $jasaProduct->store;
        $user = $store->owner;
        
        $output = "Account Details:\n";
        $output .= "Email: " . $user->email . "\n";
        $output .= "Password: password\n";
        $output .= "Store: " . $store->name . "\n";
        $output .= "Product: " . $jasaProduct->name . "\n";
        
        file_put_contents('jasa_credentials.txt', $output);
        echo "Successfully wrote to jasa_credentials.txt\n";
    } else {
        file_put_contents('jasa_credentials.txt', "No 'jasa' category product found.");
        echo "No 'jasa' category product found.\n";
    }
} catch (\Exception $e) {
    file_put_contents('jasa_credentials.txt', "Error: " . $e->getMessage());
    echo "Error: " . $e->getMessage() . "\n";
}
