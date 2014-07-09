<?php
require_once '../lib/Mustache/Autoloader.php';
Mustache_Autoloader::register();

$engine = new Mustache_Engine();

$time_start = microtime(true);
for ( $n=0; $n <= 100000; ++$n ) {
	$vars['id'] = "divid";
	$vars['body'] = 'my div\'s body';
	$html = $engine->render('<div id="{{ id }}">{{ body }}</div>', $vars );
}
echo "time: " . ( microtime(true) - $time_start ) . "\n";
echo "$html\n";

