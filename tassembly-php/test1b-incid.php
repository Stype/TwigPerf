<?php
require_once( '../lib/tassembly-php/TAssembly.php' );

$time_start = microtime(true);
$template = '["<div",["attr",{"id":"m.id"}],">",["text","m.body"],"</div>"]';
$ir = json_decode( $template, true );

$model = array();
for ( $n=0; $n <= 100000; ++$n ) {
	$model['id'] = "divid$n";
	$model['body'] = 'my div\'s body';
	$html = TAssembly::render( $ir, $model );
}
echo "time: " . ( microtime(true) - $time_start ) . "\n";
echo "$html\n";

