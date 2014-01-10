<?php
require_once '../lib/Mustache/Autoloader.php';
Mustache_Autoloader::register();

$engine = new Mustache_Engine();

$items = array();
for ( $n=0; $n <= 1000; ++$n ) {
	$items['a'.mt_rand()] = time();
}

$time_start = microtime(true);
for ( $n=0; $n <= 1000; ++$n ) {
	$key = array_rand( $items );
	$items[$key] = array( 'value' => mt_rand() . time() );
	$vars['items'] = array_keys( $items );
	$vars['id'] = "divid";
	$vars['body'] = 'my div\'s body';
	$vars['getvalues'] = function($text,  Mustache_LambdaHelper $helper) use ( $items ) {
		$index = $helper->render($text);
		return $items[$index];
	};
	$html = @$engine->render('<div id="{{ id }}">{{# items }}<div id="{{ . }}">{{# getvalues }}{{ . }}{{/ getvalues }}</div>{{/ items }}</div>', $vars );

}
echo "time: " . ( microtime(true) - $time_start );
echo "\n$html\n";

