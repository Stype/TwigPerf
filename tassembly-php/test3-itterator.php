<?php
require_once( '../lib/tassembly-php/TAssembly.php' );

$items = array();
for ( $n=0; $n <= 1000; ++$n ) {
	$items[] = "value:" . mt_rand();
}

$time_start = microtime(true);
$template = json_decode('["<div",["attr",{"id":"m.id"}],">",["foreach",{"data":"m.items","tpl":["<p>",["text","m"],"</p>"]}],"</div>\n"]',
	true);

for ( $n=0; $n <= 1000; ++$n ) {
	$key = array_rand( $items );
	$items[$key] = 'b:'.mt_rand();
	$vars['items'] = $items;
	$vars['id'] = "divid";
	$vars['body'] = 'my div\'s body';
	$html = TAssembly::render( $template, $vars );
}
echo "time: " . ( microtime(true) - $time_start ) . "\n";
//echo "$html\n";

