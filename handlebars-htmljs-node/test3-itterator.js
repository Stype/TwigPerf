var HTML = require('./htmljs');

var compile = function(vars) {
	// hand-compiled to HTMLjs by CSA
	// '<div id="{{ id }}">{{# items }}<p>{{ . }}</p>{{/ items }}</div>'

	var each = function(context, pattern) {
		var render = function() {
			return context.map(function(el) { return pattern(el); });
		};
		return {
			instantiate: function(parentComponent) {
				return { render: render };
			}
		};
	};

	return HTML.DIV(
		{id: function() { return vars.id; }},
		function() {
			return each(vars.items, function(vars) {
				return HTML.P(function(){ return vars });
			});
		});
};

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
	template = compile(vars);
for ( n=0; n <= 1000; ++n ) {
	var key = Math.floor( Math.random() * items.length );
	items[key] = 'b:' + mt_rand();
	vars.items = items;
	vars.body = 'my div\'s body';
	html = HTML.toHTML(template);
}
console.log("time: " + ((new Date() - startTime) / 1000));
//console.log(html);
