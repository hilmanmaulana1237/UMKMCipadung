$service = new \App\Services\KieAIService();
$res = $service->createVideoTask(
    'test prompt',
    'https://raw.githubusercontent.com/hilman1237050020/AplikasiPenjadwalan-UAS-PBO/refs/heads/main/Dimsum1260-700.jpeg'
);
echo "DEBUG_RESULT_START\n";
echo json_encode($res, JSON_PRETTY_PRINT);
echo "\nDEBUG_RESULT_END";
