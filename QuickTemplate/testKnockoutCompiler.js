var c = require('./KnockoutCompiler.js'),
	qt = require('./quicktemplate.js');

function test(input) {
	var json = c.compile(input),
		tpl = qt.compile(json);
	console.log(JSON.stringify(json, null, 2));
	console.log(tpl({
		items: [
			{
				key: 'key1',
				value: 'value1'
			},
			{
				key: 'key2',
				value: 'value2'
			}
		],
		name: 'Some name',
		content: 'Some sample content',
		id: 'mw1234',
		predTrue: true,
		predFalse: false
	}));
}

test('<div data-bind="attr: {title: name}, foreach: items">'
				+ '<span data-bind="attr: {title: key}, text: value"></span></div>');

test('<div data-bind="if: predTrue">Hello world</div>');
test('<div data-bind="if: predFalse">Hello world</div>');
// constant
test('<div data-bind="text: \'foo\'">Hello world</div>');
