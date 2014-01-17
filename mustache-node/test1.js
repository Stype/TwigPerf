var mustache = require('mustache');

var startTime = new Date(),
	vars = {};
for ( n=0; n <= 100000; ++n ) {
	vars.id = "divid";
	vars.body = 'my div\'s body';
	html = mustache.render('<div id="{{ id }}">{{ body }}</div>', vars );
}
console.log("time: " + ((new Date() - startTime) / 1000));
console.log(html);
