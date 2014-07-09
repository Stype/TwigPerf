var ko = require('knockoff');
var ta = require('tassembly');

function mt_rand () {
	//[0..1] * PHP mt_getrandmax()
	return Math.floor(Math.random() * 2147483647);
}

function array_rand (arr) {
	var i = Math.floor( Math.random() * arr.length );
	return arr[i];
}

var vars = {},
	items = {};

for ( var n=0; n <= 1000; ++n ) {
	items['a' + mt_rand()] = new Date().getTime();
}

vars.items = Object.keys(items);
vars.getvalues = function(i) {
	return items[i];
};

var templateTAssembly = ko.compile('<div data-bind="attr:{id:id},foreach:items"><div data-bind="attr:{id:$data},text:$parent.getvalues($data)"></div></div>',
        {toTAssembly: true});
var startTime = new Date();
var template = ta.compile(templateTAssembly);
for ( n=0; n <= 1000; ++n ) {
	var key = array_rand(vars.items);
	items[key] = 'b' + mt_rand();
	vars.id = "divid";
	vars.body = 'my div\'s body';
	html = template(vars);
}
console.log("time: " + ((new Date() - startTime) / 1000));
//console.log(html);
