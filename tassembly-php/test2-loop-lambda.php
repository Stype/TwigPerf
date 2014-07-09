<?php
require_once( '../lib/tassembly-php/TAssembly.php' );

$items = array();
for ( $n=0; $n <= 1000; ++$n ) {
	$items['a'.mt_rand()] = time();
}

$time_start = microtime(true);
$template = json_decode('["<div",["attr",{"id":"m.id"}],">",["foreach",{"data":"m.items","tpl":["<div",["attr",{"id":"m"}],">",["text","rc.g.getvalues(m)"],"</div>"]}],"</div>\n"]',
	true);

$options = Array(
	'globals' => Array(
		'getvalues' => function ( $key ) {
			global $items;
			return '' . $items[$key];
		}
	)
);


for ( $n=0; $n <= 1000; ++$n ) {
	$vars['items'] = array_keys( $items );
	$vars['id'] = "divid";
	$vars['body'] = 'my div\'s body';
	$html = TAssembly::render( $template, $vars, $options );
}
echo "time: " . ( microtime(true) - $time_start ) . "\n";
//echo "$html\n";

