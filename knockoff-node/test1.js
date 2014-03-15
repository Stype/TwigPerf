var KnockOff = require('knockoff').KnockOff;

var startTime = new Date(),
	vars = {},
	ko = new KnockOff(),
	template = ko.compile('<div data-bind="attr:{id:id}, text: body"></div>');
for ( n=0; n <= 100000; ++n ) {
	vars.id = "divid";
	vars.body = 'my div\'s body';
	html = template(vars);
}
console.log("time: " + ((new Date() - startTime) / 1000));
console.log(html);
