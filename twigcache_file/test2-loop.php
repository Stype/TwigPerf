<?php
require_once '../lib/Twig/Autoloader.php';
Twig_Autoloader::register();


$loader = new Twig_Loader_Filesystem('templates');
$twig = new Twig_Environment( $loader, array(
    'cache' => 'cache',
) );

$items = array();
for ( $n=0; $n <= 1000; ++$n ) {
	$items['a'.mt_rand()] = time();
}

$time_start = microtime(true);
for ( $n=0; $n <= 1000; ++$n ) {
	$key = array_rand( $items );
	$items[$key] = 'b'.mt_rand();
	$vars['items'] = $items;
	$vars['id'] = "divid";
	$vars['body'] = 'my div\'s body';
	$html = $twig->render( 'test2_multidiv.html', $vars );
}
echo "time: " . ( microtime(true) - $time_start ) . "\n";
#echo "$html\n";

