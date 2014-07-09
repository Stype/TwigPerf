var Spacebars = require('./spacebars-compiler');
var UI = require('./ui');

var compile = function(template_source) {
  var src = Spacebars.compile( template_source );
  var fun = eval(src);
  var comp = UI.block(fun);
  var rendered = comp.render();
  return { comp: comp, rendered: rendered };
};
var render = function(template, data) {
  //return UI.toHTML(template.comp.withData(data));
  // reuse component object & cached rendering
  template.comp.data = data;
  return UI.toHTML(template.rendered);
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
	vars = {},
	template = compile('<div id="{{ id }}">{{#each m_items }}<div id="{{ key }}">{{ val }}</div>{{/each}}</div>');
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
	html = render(template, vars);
}
console.log("time: " + ((new Date() - startTime) / 1000));
//console.log(html);
