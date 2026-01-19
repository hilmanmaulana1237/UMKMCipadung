<?php
$file = storage_path('logs/laravel.log');
$lines = 50;
$handle = fopen($file, "r");
$linecount = 0;
while(!feof($handle)){
  $line = fgets($handle);
  $linecount++;
}

fseek($handle, 0);
$pos = -2;
$t = " ";
while ($lines > 0) {
    $t = fgetc($handle);
    fseek($handle, $pos--, SEEK_END);
    if ($t === "\n") {
        $lines--;
    }
    if (ftell($handle) === 0) {
        break;
    }
}
while(!feof($handle)){
  echo fgets($handle);
}
fclose($handle);
