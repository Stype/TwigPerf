var ko = require('knockoff');

function mt_rand () {
	//[0..1] * PHP mt_getrandmax()
	return Math.floor(Math.random() * 2147483647);
}

function array_rand (arr) {
	var i = Math.floor( Math.random() * arr.length );
	return arr[i];
}

var vars = {},
	items = [];

for ( var n=0; n <= 1000; ++n ) {
	items[n] = "value:" + mt_rand();
}

var startTime = new Date(),
	template = ko.compile('<div data-bind="attr:{id:id},foreach:items"><p data-bind="text:$data"></p></div>');
for ( n=0; n <= 1000; ++n ) {
	var key = Math.floor( Math.random() * items.length );
	items[key] = 'b:' + mt_rand();
	vars.items = items;
	html = template(vars);
}
console.log("time: " + ((new Date() - startTime) / 1000));
//console.log(html);
