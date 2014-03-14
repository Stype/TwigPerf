<?php
require_once '../lib/lightncandy/src/lightncandy.php';

// Rendered PHP of template
$phpStr = LightnCandy::compile(
	'<div id="{{ id }}">{{# items }}<div id="{{.}}">{{# getvalues}}{{.}}{{/ getvalues}}</div>{{/ items }}</div>',
	array(
		'flags' => LightnCandy::FLAG_THIS,
		'blockhelpers' => array(
			// Flags and helper functions
			'getvalues' => function ( $context ) {
				$items = getItems();
				return '' . $items[$context];
			}
		)
	)
);

// Store the template...
// Method 1 (preferred):
//$php_inc = './cache/' . substr( basename( __FILE__ ), 0, -4 ) . '.cache.php';
//file_put_contents($php_inc, $phpStr);
//$renderer = include($php_inc);
// Method 2 (potentially insecure):
$renderer = LightnCandy::prepare( $phpStr );

$items = array();
for ( $n=0; $n <= 1000; ++$n ) {
	$items['a'.mt_rand()] = time();
}

function getItems() {
	global $items;
	return $items;
}

$time_start = microtime(true);
for ( $n=0; $n <= 1000; ++$n ) {
	$vars['items'] = array_keys( $items );
	$vars['id'] = "divid";
	$vars['body'] = 'my div\'s body';
	$html = $renderer( $vars );
}
echo "time: " . ( microtime(true) - $time_start ) . "\n";
echo "$html\n";

