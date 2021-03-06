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
	test2-loop-lambda.php
done

echo "*** test3 (`pwd`)***"
for i in {1..10}
do
	php test3-itterator.php
done

cd ..


echo "done"
