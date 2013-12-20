<?php

$wgWellFormedXml = true;

require_once 'Html.php';
require_once 'Xml.php';

$time_start = microtime(true);
for ( $n=0; $n <= 100000; ++$n ) {
	$vars['id'] = "divid";
	$vars['body'] = 'my div\'s body';
	$html = Html::element( 'div', array( 'id' => $vars['id'] ), $vars['body'] );
}
echo "time: " . ( microtime(true) - $time_start );
echo "\n$html\n";
