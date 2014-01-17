<?php
require_once '../lib/Twig/Autoloader.php';
Twig_Autoloader::register();


$loader = new Twig_Loader_Filesystem('templates');
$twig = new Twig_Environment( $loader, array(
    'cache' => 'cache',
) );

$time_start = microtime(true);
for ( $n=0; $n <= 100000; ++$n ) {
	$vars['id'] = "divid";
	$vars['body'] = 'my div\'s body';
	$html = $twig->render( 'test1_singlediv.html', $vars );
}
echo "time: " . ( microtime(true) - $time_start ) . "\n";
echo "$html\n";

