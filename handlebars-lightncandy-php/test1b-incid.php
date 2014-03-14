<?php
require_once '../lib/lightncandy/src/lightncandy.php';

// Rendered PHP of template
$phpStr = LightnCandy::compile( '<div id="{{ id }}">{{ body }}</div>' );

// Store the template...
// Method 1 (preferred):
//$php_inc = './cache/' . substr( basename( __FILE__ ), 0, -4 ) . '.cache.php';
//file_put_contents($php_inc, $phpStr);
//$renderer = include($php_inc);
// Method 2 (potentially insecure):
$renderer = LightnCandy::prepare( $phpStr );

$time_start = microtime(true);
for ( $n=0; $n <= 100000; ++$n ) {
	$vars['id'] = "divid$n";
	$vars['body'] = 'my div\'s body';
	$html = $renderer( $vars );
}
echo "time: " . ( microtime(true) - $time_start ) . "\n";
echo "$html\n";


