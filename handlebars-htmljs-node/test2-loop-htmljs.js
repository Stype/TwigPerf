var HTML = require('./htmljs');

var compile = function(vars) {
	// hand-compiled to HTMLjs by CSA
	// '<div id="{{ id }}">{{# m_items }}<div id="{{ key }}">{{ val }}</div>{{/ m_items }}</div>'

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
			return each(vars.m_items, function(vars) {
				return HTML.DIV(
					{id: function() {return vars.key; }},
					function() { return vars.val; });
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
	items = {};

for ( var n=0; n <= 1000; ++n ) {
	items['a' + mt_rand()] = new Date().getTime();
}

var startTime = new Date(),
	template = compile(vars);
for ( n=0; n <= 1000; ++n ) {
	var key = array_rand(Object.keys(items));
	items[key] = 'b' + mt_rand();
	vars.id = "divid";
	vars.body = 'my div\'s body';
	var m_items = [];
	for(key in items) {
		var val = items[key];
		m_items.push({ key: key, val: val });
	}
	vars.m_items = m_items;
	html = HTML.toHTML(template);
}
console.log("time: " + ((new Date() - startTime) / 1000));
//console.log(html);
