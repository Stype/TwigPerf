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

var startTime = new Date(),
	vars = {},
	template = compile('<div id="{{ id }}">{{ body }}</div>');
for ( n=0; n <= 100000; ++n ) {
	vars.id = "divid" + n;
	vars.body = 'my div\'s body';
	html = render(template, vars);
}
console.log("time: " + ((new Date() - startTime) / 1000));
console.log(html);
