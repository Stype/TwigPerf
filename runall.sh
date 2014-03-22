#!/bin/bash -e

if [ "$1" == "-q" ];then
    quiet="y"
fi

function runTestPHP {
    runTest php "(PHP)" "$@"
    runTest "hhvm -vEval.Jit=1" "(HHVM)" "$@"
	
}

function runTestNode {
    runTest node "(node.js)" "$@"
}

function runTest {
iterations=50

cd $4
echo -e "Set: \033[35;40m$3 $2\033[0;00m (${PWD##*/})"

for (( i=5; i<=$#; i++ ))
do
    sum=0
    min=0
    max=0

    echo -ne "Test: \033[36;40m${!i}\033[0;00m"
    ((i++))

    if [ -z "$quiet" ];then
        echo -n " [000]"
    fi
    for j in $(seq -f "%03g" 0 $iterations)
    do
        if [ -z "$quiet" ];then
            echo -ne "\b\b\b\b$j]"
        fi
        result=`$1 ${!i}`
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

runTestNode \
	"Knockoff" \
	knockoff-node \
	"test1"        "test1.js" \
	"test1b"       "test1b-incid.js" \
	"test2"        "test2-loop.js" \
	"test2 lambda" "test2-loop-lambda.js" \
	"test3"        "test3-itterator.js"

runTestNode \
	"Handlebars" \
	handlebars-node \
	"test1"        "test1.js" \
	"test1b"       "test1b-incid.js" \
	"test2"        "test2-loop.js" \
	"test2 lambda" "test2-loop-lambda.js" \
	"test3"        "test3-itterator.js"

runTestNode \
	"Spacebars/TAssembly" \
	handlebars-htmljs-node \
	"test1"        "test1-sbqt.js" \
	"test2"        "test2-loop-sbqt.js"

runTestNode \
	"Mustache" \
	mustache-node \
	"test1"        "test1.js" \
	"test1b"       "test1b-incid.js" \
	"test2"        "test2-loop.js" \
	"test2 lambda" "test2-loop-lambda.js" \
	"test3"        "test3-itterator.js"

runTestPHP \
	"Handlebars lightncandy" \
	handlebars-lightncandy-php \
	"test1"        "test1.php" \
	"test1b"       "test1b-incid.php" \
	"test2"        "test2-loop.php" \
	"test2 lambda" "test2-loop-lambda.php" \
	"test3"        "test3-itterator.php"

runTestPHP \
	"Mustache" \
	mustache \
	"test1"        "test1.php" \
	"test1b"       "test1b-incid.php" \
	"test2"        "test2-loop.php" \
	"test2 lambda" "test2-loop-lambda.php" \
	"test3"        "test3-itterator.php"

runTestPHP \
	"MediaWiki Templates" \
	mediawiki \
	"test1"        "test1.php" \
	"test1b"       "test1b-incid.php" \
	"test2"        "test2-loop.php" \
	"test3"        "test3-itterator.php"

runTestPHP \
	"Twig String (No Cache)" \
	twignocache \
	"test1"        "test1.php" \
	"test1b"       "test1b-incid.php" \
	"test2"        "test2-loop.php" \
	"test3"        "test3-itterator.php"

runTestPHP \
	"Twig File (No Cache)" \
	twignocache_file \
	"test1"        "test1.php" \
	"test1b"       "test1b-incid.php" \
	"test2"        "test2-loop.php" \
	"test3"        "test3-itterator.php"

runTestPHP \
	"Twig File (Cached)" \
	twigcache_file \
	"test1"        "test1.php" \
	"test1b"       "test1b-incid.php" \
	"test2"        "test2-loop.php" \
	"test3"        "test3-itterator.php"

runTestNode \
	"Handlebars HTMLJS" \
	handlebars-htmljs-node \
	"test1"        "test1-htmljs.js" \
	"test1b"       "test1b-incid-htmljs.js" \
	"test2"        "test2-loop-htmljs.js" \
	"test3"        "test3-itterator-htmljs.js"

runTestNode \
	"Spacebars/HTMLJS" \
	handlebars-htmljs-node \
	"test1"        "test1-sb.js" \
	"test1b"       "test1b-incid-sb.js" \
	"test2"        "test2-loop-sb.js" \
	"test2 lambda" "test2-loop-lambda-sb.js" \
	"test3"        "test3-itterator-sb.js"

