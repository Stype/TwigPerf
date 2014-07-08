var hogan = require('hogan.js');

var startTime = new Date(),
	template = hogan.compile('<div id="{{ id }}">{{ body }}</div>'),
	vars = {};
for ( n=0; n <= 100000; ++n ) {
	vars.id = "divid" + n;
	vars.body = 'my div\'s body';
	html = template.render(vars);
}
console.log("time: " + ((new Date() - startTime) / 1000));
console.log(html);
