var HTML = require('./htmljs');

var Context = function() { };
Context.prototype.compile = function() {
	// hand-compiled to HTMLjs by CSA
	// '<div id="{{ id }}">{{ body }}</div>'
	var self = this;
	return HTML.DIV({id: function() { return self.$id; }},
	                function() { return self.$body; });
};
Context.prototype.subst = function(t) {
	return HTML.toHTML(t);
};

var startTime = new Date(),
	vars = new Context(),
	template = vars.compile();
for ( n=0; n <= 100000; ++n ) {
	vars.$id = "divid";
	vars.$body = 'my div\'s body';
	html = vars.subst(template);
}
console.log("time: " + ((new Date() - startTime) / 1000));
console.log(html);
