/*
 * Prototype JSON template IR evaluator
 *
 * Motto: Fast but safe!
 *
 * A string-based template representation that can be compiled from DOM-based
 * templates (knockoutjs syntax for example) and can statically enforce
 * balancing and contextual sanitization to prevent XSS, for example in href
 * and src attributes. The JSON format is compact, can easily be persisted and
 * can be evaluated with a tiny library (this file).
 *
 * Performance is on par with compiled handlebars templates, the fastest
 * string-based library in our tests.
 *
 * Input examples:
 * ['<div',['attr',{id:'id'}],'>',['text','body'],'</div>']
 * ['<div',['attr',{id:'id'}],'>',
 *	['foreach',{data:'m_items',tpl:['<div',['attr',{id:'key'}],'>',['text','val'],'</div>']}],
 * '</div>']
 */


function QuickTemplate () { }

QuickTemplate.prototype.evalExpr = function (expression, scope) {
	// Simple case / fast path
	if (/^[a-zA-Z_]+$/.test(expression)) {
		return scope[expression];
	}

	// String literal
	if (/^'.*'$/.test(expression)) {
		return expression.slice(1,-1).replace(/\\'/g, "'");
	}


	// Somewhat dodgy attempt to limit the power of expressions to dot
	// notation for now
	var bits = (''+expression).split('.'),
		cur = scope;
	try {
		for (var i = 0; i < bits.length; i++) {
			var bit = bits[i];
			if (bit === '__proto__' || bit === 'constructor') {
				throw('illegal member ' + bit_);
			}
			cur = cur[bit];
		}
		return cur;
	} catch (e) {
		console.error(e);
		return '';
	}
};

/*
 * Optimized evalExpr stub for the code generator
 *
 * Directly dereference the scope for simple expressions (the common case),
 * and fall back to the full method otherwise.
 */
function evalExprStub(expr) {
	if (/^[a-zA-Z_]+$/.test(expr)) {
		// fast case
		return 'scope[' + JSON.stringify(expr) + ']';
	} else {
		return 'evalExpr(' + JSON.stringify(expr) + ', scope)';
	}
}

QuickTemplate.prototype.ctlFn_foreach = function(options, scope, cb) {
	// deal with options
	var iterable = this.evalExpr(options.data, scope),
		// worth compiling the nested template
		tpl = this.compile(options.tpl, cb),
		l = iterable.length;
	for(var i = 0; i < l; i++) {
		tpl(iterable[i]);
	}
};

QuickTemplate.prototype.ctlFn_if = function(options, scope, cb) {
	if (this.evalExpr(options.data, scope)) {
		this.render(options.tpl, scope, cb);
	}
};

QuickTemplate.prototype.ctlFn_ifnot = function(options, scope, cb) {
	if (!this.evalExpr(options.data, scope)) {
		this.render(options.tpl, scope, cb);
	}
};

QuickTemplate.prototype.ctlFn_attr = function(options, scope, cb) {
	var self = this;
	Object.keys(options).forEach(function(name) {
		var attVal = self.evalExpr(options[name], scope);
		if (attVal !== null) {
			cb(' ' + name + '="'
				+ attVal.toString().replace(/"/g, '&quot;')
				+ '"');
		}
	});
};

// Actually handled inline for performance
//QuickTemplate.prototype.ctlFn_text = function(options, scope, cb) {
//	cb(this.evalExpr(options, scope));
//};


QuickTemplate.prototype.render = function(template, scope, cb) {
	var res;
	if (!cb) {
		res = [];
		cb = function(bit) {
			res.push(bit);
		};
	}

	var self = this,
		l = template.length;
	for(var i = 0; i < l; i++) {
		var bit = template[i],
			c = bit.constructor;
		if (c === String) {
			cb(bit);
		} else if (c === Array) {
			// control structure
			var fnName = bit[0];
			if (fnName === 'text') {
				cb(this.evalExpr(bit[1], scope));
			} else if ( fnName === 'attr' ) {
				var keys = Object.keys(bit[1]);
				for (var j = 0; j < keys.length; j++) {
					var name = keys[j],
						attVal = self.evalExpr(options[name], scope);
					if (attVal !== null) {
						cb(' ' + name + '="'
							+ attVal.toString().replace(/"/g, '&quot;')
							+ '"');
					}
				}
			} else {

				try {
					self['ctlFn_' + bit[0]](bit[1], scope, cb);
				} catch(e) {
					console.error('Unsupported control function:', bit, e);
				}
			}
		} else {
			console.error('Unsupported type:', bit);
		}
	}
	if(res) {
		return res.join('');
	}
};


QuickTemplate.prototype.assemble = function(template, cb) {
	var code = [];
	code.push('var attVal, evalExpr = this.evalExpr;');
	if (!cb) {
		code.push('var res = "", cb = function(bit) { res += bit; };');
	}

	var self = this,
		l = template.length;
	for(var i = 0; i < l; i++) {
		var bit = template[i],
			c = bit.constructor;
		if (c === String) {
			// static string
			code.push('cb(' + JSON.stringify(bit) + ');');
		} else if (c === Array) {
			// control structure
			var fnName = bit[0];

			if (fnName === 'text') {
				code.push('cb(' + evalExprStub(bit[1]) + ');');
			} else if ( fnName === 'attr' ) {
				var names = Object.keys(bit[1]);
				for(var j = 0; j < names.length; j++) {
					var name = names[j];
					code.push('attVal = ' + evalExprStub(bit[1][name]) + ';');
					code.push("if (attVal !== null) { "
						+ "cb(" + JSON.stringify(' ' + name + '="')
						+ " + (''+attVal).replace(/\"/g, '&quot;') "
						+ "+ '\"');}");
				}
			} else {
				// Generic control function call
				code.push('try {');
				// call the method
				code.push('this[' + JSON.stringify('ctlFn_' + bit[0])
						+ '](' + JSON.stringify(bit[1]) + ', scope, cb);');
				code.push('} catch(e) {');
				code.push("console.error('Unsupported control function:', "
						+ JSON.stringify(bit[0]) + ", e.stack);");
				code.push('}');
			}
		} else {
			console.error('Unsupported type:', bit);
		}
	}
	if (!cb) {
		code.push("return res;");
	}
	return code.join('\n');
};

QuickTemplate.prototype.compile = function(template, cb) {
	if (template.__tpl) {
		return template.__tpl;
	}
	var self = this,
		code = this.assemble(template, cb);
	//console.log(code);
	var fun = new Function('scope', 'cb', code);
	// bind this and cb
	var res = function (scope) {
		return fun.call(self, scope, cb);
	};
	template.__tpl = res;
	return res;
};

module.exports = new QuickTemplate();
