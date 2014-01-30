var c = require('./KnockoutCompiler.js');

function test(input) {
	console.log(JSON.stringify(c.compile(input), null, 2));
}

test('<div data-bind="attr: {title: foo}, foreach: foo">'
				+ '<span data-bind="text: bar"></span></div>');

test('<div data-bind="if: foo">Hello world</div>');
