#!/bin/bash

function runTest {
	iterations=10

	cd $2
	echo -e "Set: \033[35;40m$1\033[0;00m (${PWD##*/})"

	for (( i=3; i<=$#; i++ ))
	do
		sum=0
		min=0
		max=0

		echo -ne "Test: \033[36;40m${!i}\033[0;00m"
		((i++))

		for (( j=1; j<=$iterations; j++ ))
		do
			echo -n " $j..."

			result=`${!i}`
			time=`echo $result | awk '{print $2}'`

			sum=`bc <<< " $sum + $time"`

			if [ $min == 0 ] || [ `bc <<< " $time < $min"` -eq 1 ]
			then
				min=$time
			fi

			if [ $max == 0 ] || [ `bc <<< " $time > $max"` -eq 1 ]
			then
				max=$time
			fi
		done

		printf " Avg: \033[33;40m%.4f\033[0;00m Min: \033[32;40m%.4f\033[0;00m Max: \033[31;40m%.4f\033[0;00m\n" `bc <<< "scale=5; $sum / $iterations"` $min $max
	done

	cd ..
}

runTest \
	"Handlebars lightncandy (PHP)" \
	handlebars-lightncandy-php \
	"test1"        "php test1.php" \
	"test1b"       "php test1b-incid.php" \
	"test2"        "php test2-loop.php" \
	"test2 lambda" "php test2-loop-lambda.php" \
	"test3"        "php test3-itterator.php"

runTest \
	"Handlebars lightncandy (PHP) (HHVM)" \
	handlebars-lightncandy-php \
	"test1"        "hhvm test1.php" \
	"test1b"       "hhvm test1b-incid.php" \
	"test2"        "hhvm test2-loop.php" \
	"test2 lambda" "hhvm test2-loop-lambda.php" \
	"test3"        "hhvm test3-itterator.php"

runTest \
	"MediaWiki Templates" \
	mediawiki \
	"test1"        "php test1.php" \
	"test1b"       "php test1b-incid.php" \
	"test2"        "php test2-loop.php" \
	"test3"        "php test3-itterator.php"

runTest \
	"Twig String (No Cache)" \
	twignocache \
	"test1"        "php test1.php" \
	"test1b"       "php test1b-incid.php" \
	"test2"        "php test2-loop.php" \
	"test3"        "php test3-itterator.php"

runTest \
	"Twig File (No Cache)" \
	twignocache_file \
	"test1"        "php test1.php" \
	"test1b"       "php test1b-incid.php" \
	"test2"        "php test2-loop.php" \
	"test3"        "php test3-itterator.php"

runTest \
	"Twig File (Cached)" \
	twigcache_file \
	"test1"        "php test1.php" \
	"test1b"       "php test1b-incid.php" \
	"test2"        "php test2-loop.php" \
	"test3"        "php test3-itterator.php"

runTest \
	"Mustache (PHP)" \
	mustache \
	"test1"        "php test1.php" \
	"test1b"       "php test1b-incid.php" \
	"test2"        "php test2-loop.php" \
	"test2 lambda" "php test2-loop-lambda.php" \
	"test3"        "php test3-itterator.php"

runTest \
	"MediaWiki Templates (HHVM)" \
	mediawiki \
	"test1"        "hhvm test1.php" \
	"test1b"       "hhvm test1b-incid.php" \
	"test2"        "hhvm test2-loop.php" \
	"test3"        "hhvm test3-itterator.php"

runTest \
	"Twig String (No Cache) (HHVM)" \
	twignocache \
	"test1"        "hhvm test1.php" \
	"test1b"       "hhvm test1b-incid.php" \
	"test2"        "hhvm test2-loop.php" \
	"test3"        "hhvm test3-itterator.php"

runTest \
	"Twig File (No Cache) (HHVM)" \
	twignocache_file \
	"test1"        "hhvm test1.php" \
	"test1b"       "hhvm test1b-incid.php" \
	"test2"        "hhvm test2-loop.php" \
	"test3"        "hhvm test3-itterator.php"

runTest \
	"Twig File (Cached) (HHVM)" \
	twigcache_file \
	"test1"        "hhvm test1.php" \
	"test1b"       "hhvm test1b-incid.php" \
	"test2"        "hhvm test2-loop.php" \
	"test3"        "hhvm test3-itterator.php"

runTest \
	"Mustache (PHP) (HHVM)" \
	mustache \
	"test1"        "hhvm test1.php" \
	"test1b"       "hhvm test1b-incid.php" \
	"test2"        "hhvm test2-loop.php" \
	"test2 lambda" "hhvm test2-loop-lambda.php" \
	"test3"        "hhvm test3-itterator.php"

runTest \
	"Mustache (node.js)" \
	mustache-node \
	"test1"        "node test1.js" \
	"test1b"       "node test1b-incid.js" \
	"test2"        "node test2-loop.js" \
	"test2 lambda" "node test2-loop-lambda.js" \
	"test3"        "node test3-itterator.js"

runTest \
	"Handlebars (node.js)" \
	handlebars-node \
	"test1"        "node test1.js" \
	"test1b"       "node test1b-incid.js" \
	"test2"        "node test2-loop.js" \
	"test2 lambda" "node test2-loop-lambda.js" \
	"test3"        "node test3-itterator.js"

runTest \
	"Handlebars HTMLJS (node.js)" \
	handlebars-htmljs-node \
	"test1"        "node test1-htmljs.js" \
	"test1b"       "node test1b-incid-htmljs.js" \
	"test2"        "node test2-loop-htmljs.js" \
	"test3"        "node test3-itterator-htmljs.js"

runTest \
	"Spacebars/HTMLJS (node.js)" \
	handlebars-htmljs-node \
	"test1"        "node test1-sb.js" \
	"test1b"       "node test1b-incid-sb.js" \
	"test2"        "node test2-loop-sb.js" \
	"test2 lambda" "node test2-loop-lambda-sb.js" \
	"test3"        "node test3-itterator-sb.js"

runTest \
	"Spacebars/QuickTemplate (node.js)" \
	handlebars-htmljs-node \
	"test1"        "node test1-sbqt.js" \
	"test2"        "node test2-loop-sbqt.js"