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
