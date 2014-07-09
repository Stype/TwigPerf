TemplatePerf
============

See https://www.mediawiki.org/wiki/Requests_for_comment/HTML_templating_library#Performance

## Usage
Apart from a checkout of this repository, you need nodejs, php5-cli and HHVM. After adding the appropriate [HHVM nightly repo](http://hhvm.com/blog/3203/nightly-packages), this should get you these dependencies on Debian / Ubuntu:
```bash
apt-get install nodejs php5-cli hhvm-nightly
```
After this preparation, you should be able to run all benchmarks with:
```bash
./runall.sh
```
This will produce output as in
[results.txt](https://github.com/gwicke/TemplatePerf/blob/master/results.txt):

```
Set: Knockoff (node.js) (knockoff-node)
Test: test1 [050] Avg: 0.0815 Min: 0.0530 Max: 0.1050
Test: test1b [050] Avg: 0.1334 Min: 0.0760 Max: 0.1510
Test: test2 [050] Avg: 0.8882 Min: 0.6440 Max: 1.1260
Test: test2 lambda [050] Avg: 0.6492 Min: 0.4730 Max: 0.7880
Test: test3 [050] Avg: 0.3166 Min: 0.1960 Max: 0.5110
Set: Handlebars (node.js) (handlebars-node)
Test: test1 [050] Avg: 0.2093 Min: 0.1270 Max: 0.2750
Test: test1b [050] Avg: 0.2911 Min: 0.1660 Max: 0.3850
Test: test2 [050] Avg: 0.8271 Min: 0.6050 Max: 1.0400
Test: test2 lambda [050] Avg: 1.4567 Min: 1.1430 Max: 2.0150
Test: test3 [050] Avg: 0.2920 Min: 0.1870 Max: 0.3680
...
```

Each test is repeated 50 times for stable results, so this will take quite a
while to finish for all libraries, runtimes & tests.

## Current results
Also see [the on-wiki version](https://www.mediawiki.org/wiki/Requests_for_comment/HTML_templating_library#Performance).

Library / runtime | Test 1 (attr/text interpolation) | Test1b (same with random attr) | Test2 (iterate obj array) | Test2 (iterate obj array, lambda) | Test3 (iterate item array)
|-----|:------|:--------|:-------|:--------|:----------|
|TAssembly (node.js) | 0.0420 | 0.0630 | 0.6190 | 0.5010 | 0.1860
|Knockoff (node.js) | 0.0530 | 0.0750 | 0.6370 | 0.4690 | 0.1970
|Handlebars (node.js) | 0.1300 | 0.1750 | 0.6060 | 1.1450 | 0.1870
|Hogan (node.js) | 0.1110 | 0.1370 | 0.6690 | 4.8780 | 0.6770
|Spacebars/TAssembly (node.js) | 0.0650 | n/a | 0.6430 | n/a | n/a
|Mustache (node.js) | 0.3570 | 0.3900 | 2.5200 | 3.8260 | 0.8830
|TAssembly (PHP) | 1.7434 | 1.7654 | 18.6634 | 81.8341 | 12.3270
|TAssembly (HHVM) | 0.5199 | 0.5317 | 3.3146 | 16.7471 | 2.1257
|Handlebars lightncandy (PHP) | 0.5395 | 0.6025 | 7.0456 | 133.2025 | 3.9837
|Handlebars lightncandy (HHVM) | 0.1919 | 0.1991 | 0.8164 | 1.3319 | 0.5254
|Mustache (PHP) | 1.7991 | 1.8606 | 11.3725 | 24.0264 | 3.6850
|Mustache (HHVM) | 0.4783 | 0.5016 | 1.2869 | 3.9279 | 0.6229
|MediaWiki Templates (PHP) | 1.6926 | 1.7354 | 17.0633 | n/a | 7.4075
|MediaWiki Templates (HHVM) | 0.5305 | 0.5147 | 4.0606 | n/a | 1.9745
|Twig String (No Cache) (PHP) | 1.3954 | 1.4701 | 6.0498 | n/a | 3.6746
|Twig String (No Cache) (HHVM) | 0.5631 | 0.5137 | 0.9394 | n/a | 0.6560
|Twig File (No Cache) (PHP) | 1.7074 | 1.7649 | 6.0364 | n/a | 3.6477
|Twig File (No Cache) (HHVM) | 0.6085 | 0.6324 | 0.9831 | n/a | 0.8150
|Twig File (Cached) (PHP) | 1.7352 | 1.7783 | 6.0423 | n/a | 3.6068
|Twig File (Cached) (HHVM) | 0.4170 | 0.4460 | 0.7116 | n/a | 0.4475
|Handlebars HTMLJS (node.js) | 0.5610 | 0.6540 | 7.1110 | n/a | 2.9330
|Spacebars/HTMLJS (node.js) | 1.1450 | 1.3080 | 59.0910 | 143.3680 | 42.2020

