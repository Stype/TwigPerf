<?php

$wgWellFormedXml = true;

require_once 'Html.php';
require_once 'Xml.php';

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
	$body = '';
	foreach ( $vars['items'] as $item ) {
		$body .= Html::element(
			'p',
			array(),
			$item
		);
	}
	$html = Html::rawElement(
		'div',
		array( 'id' => $vars['id'] ),
		$body
	);
}
echo "time: " . ( microtime(true) - $time_start );
#echo "\n$html\n";
