<?php
$file = 'c:\laragon\www\lomba\PWA1\storage\logs\laravel.log';
$size = filesize($file);
$handle = fopen($file, "rb");

// Read last 100KB
$bufferSize = 100000;
if ($size > $bufferSize) {
    fseek($handle, -$bufferSize, SEEK_END);
}
$content = fread($handle, $bufferSize);
fclose($handle);

// Split into lines
$lines = explode("\n", $content);

// Find lines with PosterAI
foreach ($lines as $line) {
    if (str_contains($line, 'PosterAI')) { // Check for PosterAI
         echo "LOG: " . trim($line) . "\n";
    }
}
