var c = require('./KnockoutCompiler.js');

console.log(
		JSON.stringify(
			c.compile('<div data-bind="attr: {title: foo}, foreach: foo"><span data-bind="text: bar"></span></div>')
			, null, 2)
		);
