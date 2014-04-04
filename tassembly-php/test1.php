<?php
require_once( '../lib/tassembly-php/TAssembly.php' );

$time_start = microtime(true);

$ta = new TAssembly\TAssembly();
$template = '["<div",["attr",{"id":"m.id"}],">",["text","m.body"],"</div>"]';

$ir = json_decode( $template, true );

for ( $n=0; $n <= 100000; ++$n ) {
	$model = array(
		'id' => 'divid',
		'body' => 'my div\'s body'
	);
	$html = $ta->render( $ir, $model );
}
echo "time: " . ( microtime(true) - $time_start ) . "\n";
echo "$html\n";

