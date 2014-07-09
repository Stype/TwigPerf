var handlebars = require('handlebars');

var template = handlebars.compile('<div id="{{ id }}">{{ body }}</div>'),
    startTime = new Date(),
	vars = {};
for ( n=0; n <= 100000; ++n ) {
	vars.id = "divid";
	vars.body = 'my div\'s body';
	html = template(vars);
}
console.log("time: " + ((new Date() - startTime) / 1000));
console.log(html);
