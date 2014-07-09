<?php
require_once( '../lib/tassembly-php/TAssembly.php' );

$items = array();
for ( $n=0; $n <= 1000; ++$n ) {
	$items['a'.mt_rand()] = time();
}

$time_start = microtime(true);
$template = json_decode('["<div",["attr",{"id":"m.id"}],">",["foreach",{"data":"m.m_items","tpl":["<div",["attr",{"id":"m.key"}],">",["text","m.val"],"</div>"]}],"</div>\n"]',
	true);

for ( $n=0; $n <= 1000; ++$n ) {
	$vars['id'] = "divid";
	$vars['body'] = 'my div\'s body';
	$m_items = array();
	foreach ( $items as $key => $val ) {
		$m_items[] = array( 'key'=>$key, 'val'=>$val );
	}
	$vars['m_items'] = $m_items;
	$html = TAssembly::render( $template, $vars );
}
echo "time: " . ( microtime(true) - $time_start ) . "\n";
//echo "$html\n";

