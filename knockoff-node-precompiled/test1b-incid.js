var ko = require('knockoff');
var ta = require('tassembly');

var vars = {};
var templateTAssembly = ko.compile(
        '<div data-bind="attr:{id:id}, text: body"></div>',
        {toTAssembly: true});
var startTime = new Date();
var template = ta.compile(templateTAssembly);

for ( n=0; n <= 100000; ++n ) {
	vars.id = "divid" + n;
	vars.body = 'my div\'s body';
	html = template(vars);
}
console.log("time: " + ((new Date() - startTime) / 1000));
console.log(html);
