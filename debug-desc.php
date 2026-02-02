$s = new \App\Services\AIService();
$res = $s->generateVisualDescription('Warung Makan Bu Ijah', 'Kuliner', 'Nasi Goreng Spesial');
echo "DEBUG_DESC_START\n";
echo $res;
echo "\nDEBUG_DESC_END";
