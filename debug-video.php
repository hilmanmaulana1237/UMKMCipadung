$c = app(\App\Http\Controllers\AIContentController::class);
$r = new \Illuminate\Http\Request();

// Mock Uploaded File
$dummyPath = sys_get_temp_dir() . '/test.jpg';
file_put_contents($dummyPath, 'dummy content');
$file = new \Illuminate\Http\UploadedFile($dummyPath, 'test.jpg', 'image/jpeg', null, true);

$r->merge([
    'mode' => 'store_photo',
    'store_name' => 'Tes Toko',
    'category' => 'Kuliner',
    'description' => 'Tes deskripsi',
    'location' => 'Bandung',
    'contact' => '08123',
    'duration' => '10'
]);
$r->files->set('photo', $file);

// Spoof User Authentication
\Illuminate\Support\Facades\Auth::loginUsingId(1); 

echo "DEBUG_VIDEO_START\n";
$res = $c->generateVideo($r);
echo $res->getContent();
echo "\nDEBUG_VIDEO_END";
