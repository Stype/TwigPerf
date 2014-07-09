<?php
require_once '../lib/Mustache/Autoloader.php';
Mustache_Autoloader::register();

$engine = new Mustache_Engine();

$items = array();
for ( $n=0; $n <= 1000; ++$n ) {
	$items[] = "value:" . mt_rand();
}

$time_start = microtime(true);
for ( $n=0; $n <= 1000; ++$n ) {
	$key = array_rand( $items );
	$items[$key] = 'b:'.mt_rand();
	$vars['items'] = $items;
	$vars['id'] = "divid";
	$vars['body'] = 'my div\'s body';
	$html = $engine->render('<div id="{{ id }}">{{# items }}<p>{{ . }}</p>{{/ items }}</div>', $vars );
}
echo "time: " . ( microtime(true) - $time_start ) . "\n";
#echo "$html\n";

