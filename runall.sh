#!/bin/bash


echo ">>>>>>>>>> MediaWiki Templates <<<<<<<<<<<<<"
cd mediawiki
echo "*** test1 (`pwd`)***"
for i in {1..10}
do
	php test1.php
done

echo "*** test1b (`pwd`)***"
for i in {1..10}
do
	php test1b-incid.php
done

echo "*** test2 (`pwd`)***"
for i in {1..10}
do
	php test2-loop.php
done

echo "*** test3 (`pwd`)***"
for i in {1..10}
do
	php test3-itterator.php
done

cd ..


echo ">>>>>>>>>> Twig String No Cache <<<<<<<<<<<<<"
cd twignocache
echo "*** test1 (`pwd`)***"
for i in {1..10}
do
	php test1.php
done

echo "*** test1b (`pwd`)***"
for i in {1..10}
do
	php test1b-incid.php
done

echo "*** test2 (`pwd`)***"
for i in {1..10}
do
	php test2-loop.php
done

echo "*** test3 (`pwd`)***"
for i in {1..10}
do
	php test3-itterator.php
done

cd ..


echo ">>>>>>>>>> Twig File No Cache <<<<<<<<<<<<<"
cd twignocache_file
echo "*** test1 (`pwd`)***"
for i in {1..10}
do
	php test1.php
done

echo "*** test1b (`pwd`)***"
for i in {1..10}
do
	php test1b-incid.php
done

echo "*** test2 (`pwd`)***"
for i in {1..10}
do
	php test2-loop.php
done

echo "*** test3 (`pwd`)***"
for i in {1..10}
do
	php test3-itterator.php
done

cd ..


echo ">>>>>>>>>> Twig File Cached <<<<<<<<<<<<<"
cd twigcache_file
echo "*** test1 (`pwd`)***"
for i in {1..10}
do
	php test1.php
done

echo "*** test1b (`pwd`)***"
for i in {1..10}
do
	php test1b-incid.php
done

echo "*** test2 (`pwd`)***"
for i in {1..10}
do
	php test2-loop.php
done

echo "*** test3 (`pwd`)***"
for i in {1..10}
do
	php test3-itterator.php
done

cd ..


echo ">>>>>>>>>> Mustache <<<<<<<<<<<<<"
cd mustache
echo "*** test1 (`pwd`)***"
for i in {1..10}
do
	php test1.php
done

echo "*** test1b (`pwd`)***"
for i in {1..10}
do
	php test1b-incid.php
done

echo "*** test2 (`pwd`)***"
for i in {1..10}
do
	php test2-loop.php
done

echo "*** test2 lambda (`pwd`)***"
for i in {1..10}
do
	php test2-loop-lambda.php
done

echo "*** test3 (`pwd`)***"
for i in {1..10}
do
	php test3-itterator.php
done

cd ..

echo ">>>>>>>>>> MediaWiki Templates (HHVM) <<<<<<<<<<<<<"
cd mediawiki
echo "*** test1 (`pwd`)***"
for i in {1..10}
do
	hhvm test1.php
done

echo "*** test1b (`pwd`)***"
for i in {1..10}
do
	hhvm test1b-incid.php
done

echo "*** test2 (`pwd`)***"
for i in {1..10}
do
	hhvm test2-loop.php
done

echo "*** test3 (`pwd`)***"
for i in {1..10}
do
	hhvm test3-itterator.php
done

cd ..


echo ">>>>>>>>>> Twig String No Cache (HHVM) <<<<<<<<<<<<<"
cd twignocache
echo "*** test1 (`pwd`)***"
for i in {1..10}
do
	hhvm test1.php
done

echo "*** test1b (`pwd`)***"
for i in {1..10}
do
	hhvm test1b-incid.php
done

echo "*** test2 (`pwd`)***"
for i in {1..10}
do
	hhvm test2-loop.php
done

echo "*** test3 (`pwd`)***"
for i in {1..10}
do
	hhvm test3-itterator.php
done

cd ..


echo ">>>>>>>>>> Twig File No Cache (HHVM) <<<<<<<<<<<<<"
cd twignocache_file
echo "*** test1 (`pwd`)***"
for i in {1..10}
do
	hhvm test1.php
done

echo "*** test1b (`pwd`)***"
for i in {1..10}
do
	hhvm test1b-incid.php
done

echo "*** test2 (`pwd`)***"
for i in {1..10}
do
	hhvm test2-loop.php
done

echo "*** test3 (`pwd`)***"
for i in {1..10}
do
	hhvm test3-itterator.php
done

cd ..


echo ">>>>>>>>>> Twig File Cached (HHVM) <<<<<<<<<<<<<"
cd twigcache_file
echo "*** test1 (`pwd`)***"
for i in {1..10}
do
	hhvm test1.php
done

echo "*** test1b (`pwd`)***"
for i in {1..10}
do
	hhvm test1b-incid.php
done

echo "*** test2 (`pwd`)***"
for i in {1..10}
do
	hhvm test2-loop.php
done

echo "*** test3 (`pwd`)***"
for i in {1..10}
do
	hhvm test3-itterator.php
done

cd ..


echo ">>>>>>>>>> Mustache (HHVM) <<<<<<<<<<<<<"
cd mustache
echo "*** test1 (`pwd`)***"
for i in {1..10}
do
	hhvm test1.php
done

echo "*** test1b (`pwd`)***"
for i in {1..10}
do
	hhvm test1b-incid.php
done

echo "*** test2 (`pwd`)***"
for i in {1..10}
do
	hhvm test2-loop.php
done

echo "*** test2 lambda (`pwd`)***"
for i in {1..10}
do
	hhvm test2-loop-lambda.php
done

echo "*** test3 (`pwd`)***"
for i in {1..10}
do
	hhvm test3-itterator.php
done

cd ..

echo ">>>>>>>>>> Mustache Node.js <<<<<<<<<<<<<"
cd mustache-node
echo "*** test1 (`pwd`)***"
for i in {1..10}
do
	node test1.js
done

echo "*** test1b (`pwd`)***"
for i in {1..10}
do
	node test1b-incid.js
done

echo "*** test2 (`pwd`)***"
for i in {1..10}
do
	node test2-loop.js
done

echo "*** test2 lambda (`pwd`)***"
for i in {1..10}
do
	node test2-loop-lambda.js
done

echo "*** test3 (`pwd`)***"
for i in {1..10}
do
	node test3-itterator.js
done

cd ..


echo "done"
