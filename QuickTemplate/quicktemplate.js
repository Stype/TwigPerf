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
"use strict";


function QuickTemplate () {
	this.uid = 0;
	// Cache for sub-structure parameters. Storing them globally keyed on uid
	// makes it possible to reuse compilations.
	this.cache = {};
}

QuickTemplate.prototype.getUID = function() {
	this.uid++;
	return this.uid;
}

QuickTemplate.prototype.evalExpr = function (expression, scope) {
	// Simple case / fast path
	if (/^[a-zA-Z_]+$/.test(expression)) {
		return scope[expression];
	}

	// String literal
	if (/^'.*'$/.test(expression)) {
		return expression.slice(1,-1).replace(/\\'/g, "'");
	}

	// Dot notation
	if (/^[a-zA-Z_]+(?:[.][a-zA-Z_])+$/.test(expression)) {
		try {
			return new Function('scope', 'return scope.' + expression)(scope);
		} catch (e) {
			return '';
		}
	}

	// Don't want to allow full JS expressions for PHP compat & general
	// sanity. We could do the heavy sanitization work in the compiler & just
	// eval simple JS-compatible expressions here (possibly using 'with',
	// although that is deprecated & disabled in strict mode). For now we play
	// it safe & don't eval the expression.
	return expression;
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
		return 'this.evalExpr(' + JSON.stringify(expr) + ', scope)';
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
				// TODO: context-sensitive sanitization on href / src / style
				// (also in compiled version at end)
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
				cb( ('' + this.evalExpr(bit[1], scope)) // convert to string
						.replace(/[<&]/g, this._xmlEncoder)); // and escape
			} else if ( fnName === 'attr' ) {
				var keys = Object.keys(bit[1]),
					options = bit[1];
				for (var j = 0; j < keys.length; j++) {
					var name = keys[j],
						attVal = self.evalExpr(options[name], scope);
					if (attVal !== null) {
						cb(' ' + name + '="'
							+ (''+attVal).replace(/[<&"]/g, this._xmlEncoder)
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

QuickTemplate.prototype._xmlEncoder = function(c){
	switch(c) {
		case '<': return '&lt;';
		case '>': return '&gt;';
		case '&': return '&amp;';
		case '"': return '&quot;';
		default: return '&#' + c.charCodeAt() + ';';
	}
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;
QuickTemplate.prototype.escHTML = function () {
	if (!string && string !== 0) {
		return "";
	}

	// Force a string conversion as this will be done by the append regardless and
	// the regex test will do this transparently behind the scenes, causing issues if
	// an object's to string has escaped characters in it.
	string = "" + string;

	if(!possible.test(string)) { return string; }
	return string.replace(badChars, this._xmlEncoder);
}

QuickTemplate.prototype.assemble = function(template, cb) {
	var code = [];
	code.push('var val;');
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
				code.push('val = "" + ' + evalExprStub(bit[1]) + ';');
				code.push('if(!/[<&]/.test(val)) { cb(val); }');
				code.push('else { cb(val.replace(/[<&]/g,this._xmlEncoder)); };');
			} else if ( fnName === 'attr' ) {
				var names = Object.keys(bit[1]);
				for(var j = 0; j < names.length; j++) {
					var name = names[j];
					code.push('val = "" + ' + evalExprStub(bit[1][name]) + ';');
					code.push("if (val !== null) { "
						// escape the attribute value
						// TODO: hook up context-sensitive sanitization for href,
						// src, style
						+ 'if(/[<&"]/.test(val)) { val = val.replace(/[<&"]/g,this._xmlEncoder); }'
						+ "cb(" + JSON.stringify(' ' + name + '="')
						+ " + val "
						+ "+ '\"');}");
				}
			} else {
				// store the args in the cache
				var uid = this.getUID();
				this.cache[uid] = bit[1];
				// Generic control function call
				code.push('try {');
				// call the method
				code.push('this[' + JSON.stringify('ctlFn_' + bit[0])
						// store in cache / unique key rather than here
						+ '](this.cache["' + uid + '"], scope, cb);');
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
	var self = this;
	// TODO: really cache compilation of sub-templates
	if (template.__tpl) {
		return function(scope) {
			return template.__tpl.call(self, scope, cb);
		}
	}
	var code = this.assemble(template, cb);
	//console.log(code);
	var fun = new Function('scope', 'cb', code);
	template.__tpl = fun;
	// bind this and cb
	var res = function (scope) {
		return fun.call(self, scope, cb);
	};
	return res;
};

module.exports = new QuickTemplate();
