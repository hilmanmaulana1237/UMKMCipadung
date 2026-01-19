<?php

use App\Models\User;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = User::where('affiliate_code', 'LISA2024')->first();

if ($user) {
    echo "Found User: " . $user->name . " (ID: " . $user->id . ", Role: " . $user->role . ")\n";
} else {
    echo "User with code LISA2024 NOT FOUND.\n";
}

$allCodes = User::whereNotNull('affiliate_code')->pluck('affiliate_code', 'name');
echo "All Codes:\n";
print_r($allCodes->toArray());
