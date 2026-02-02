<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "Testing UMKM Login\n";
echo "==================\n\n";

$user = User::where('email', 'umkm@demo.com')->first();

if (!$user) {
    echo "❌ User not found in database!\n";
    echo "Available users:\n";
    $users = User::all();
    foreach ($users as $u) {
        echo "  - {$u->email} ({$u->role})\n";
    }
    exit;
}

echo "✅ User found:\n";
echo "   Name: {$user->name}\n";
echo "   Email: {$user->email}\n";
echo "   Role: {$user->role}\n";
echo "   Email Verified: " . ($user->email_verified_at ? 'Yes' : 'No') . "\n";
echo "   Password Hash: " . substr($user->password, 0, 30) . "...\n\n";

echo "Testing password 'password':\n";
$isValid = Hash::check('password', $user->password);
echo "   Result: " . ($isValid ? "✅ VALID" : "❌ INVALID") . "\n\n";

if (!$isValid) {
    echo "Creating new hash for 'password':\n";
    $newHash = Hash::make('password');
    echo "   New Hash: " . substr($newHash, 0, 30) . "...\n";
    echo "   Test New Hash: " . (Hash::check('password', $newHash) ? "✅ VALID" : "❌ INVALID") . "\n";
}
