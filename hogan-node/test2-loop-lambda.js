var hogan = require('hogan.js');

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

var startTime = new Date(),
	template = hogan.compile('<div id="{{ id }}">{{# items }}<div id="{{ . }}">{{# getvalues }}{{ . }}{{/ getvalues }}</div>{{/ items }}</div>');

vars.items = Object.keys(items);
vars.getvalues = function() {
    var tpl = hogan.compile(this);
	var index = tpl.render();
	return items[index];
};
for ( n=0; n <= 1000; ++n ) {
	var key = array_rand(vars.items);
	items[key] = 'b' + mt_rand();
	vars.id = "divid";
	vars.body = 'my div\'s body';
	html = template.render(vars);
}
console.log("time: " + ((new Date() - startTime) / 1000));
//console.log(html);
