<?php
require_once '../lib/Twig/Autoloader.php';
Twig_Autoloader::register();


$loader = new Twig_Loader_String();
$twig = new Twig_Environment( $loader );

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
	$html = $twig->render('<div id="{{ id }}">{% for item in items %}<p>{{ item }}</p>{% endfor %}</div>', $vars );
}
echo "time: " . ( microtime(true) - $time_start ) . "\n";
#echo "$html\n";

