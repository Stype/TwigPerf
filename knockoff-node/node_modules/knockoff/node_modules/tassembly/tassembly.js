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


function TAssembly () {
	this.uid = 0;
	// Cache for sub-structure parameters. Storing them globally keyed on uid
	// makes it possible to reuse compilations.
	this.cache = {};
	// Partials: tassembly objects
	this.partials = {};
}

TAssembly.prototype._getUID = function() {
	this.uid++;
	return this.uid;
};

var simpleExpression = /^(?:[.][a-zA-Z_$]+)+$/,
	complexExpression = new RegExp('^(?:[.][a-zA-Z_$]+'
			+ '(?:\\[(?:[0-9.]+|["\'][a-zA-Z0-9_$]+["\'])\\])?'
			+ '(?:\\((?:[0-9a-zA-Z_$.]+|["\'][a-zA-Z0-9_$\.]+["\'])\\))?'
			+ ')+$');
TAssembly.prototype._evalExpr = function (expression, scope) {
	var func = this.cache['expr' + expression];
	if (!func) {
		// Simple variable / fast path
		if (/^[a-zA-Z_$]+$/.test(expression)) {
			return scope[expression];
		}

		// String literal
		if (/^'.*'$/.test(expression)) {
			return expression.slice(1,-1).replace(/\\'/g, "'");
		}

		// Dot notation, array indexing and function calls
		// a.b.c
		// literal array indexes (number and string) and nullary functions only
		// a[1]().b['b']()
		var texpression = '.' + expression;
		if (simpleExpression.test(texpression) || complexExpression.test(texpression)) {
				func = new Function('scope', 'var $index = scope.$index;'
						+ 'var $data = scope.$data;'
						+ 'var $parent = scope.$parent;'
						+ 'return scope' + texpression);
			this.cache['expr' + expression] = func;
		}
	}
	if (func) {
		try {
			return func(scope);
		}  catch (e) {
			console.log(e);
			return '';
		}
	}

	// Don't want to allow full JS expressions for PHP compat & general
	// sanity. We could do the heavy sanitization work in the compiler & just
	// eval simple JS-compatible expressions here (possibly using 'with',
	// although that is deprecated & disabled in strict mode). For now we play
	// it safe & don't eval the expression. Can relax this later.
	return expression;
};

/*
 * Optimized _evalExpr stub for the code generator
 *
 * Directly dereference the scope for simple expressions (the common case),
 * and fall back to the full method otherwise.
 */
function evalExprStub(expr) {
	if (/^[a-zA-Z_$]+$/.test(expr)) {
		// simple variable, the fast and common case
		return 'scope[' + JSON.stringify(expr) + ']';
	} else {
		return 'this._evalExpr(' + JSON.stringify(expr) + ', scope)';
	}
}

TAssembly.prototype._getTemplate = function (tpl, cb) {
	if (Array.isArray(tpl)) {
		return tpl;
	} else {
		// String literal: strip quotes
		if (/^'.*'$/.test(tpl)) {
			tpl = tpl.slice(1,-1).replace(/\\'/g, "'");
		}
		return this.partials[tpl];
	}
};

TAssembly.prototype.ctlFn_foreach = function(options, scope, cb) {
	// deal with options
	var iterable = this._evalExpr(options.data, scope),
		// worth compiling the nested template
		tpl = this.compile(this._getTemplate(options.tpl), cb),
		l = iterable.length,
		itemWrapper = Object.create(null);
	for(var i = 0; i < l; i++) {
		var item = iterable[i];
		if (!item || typeof item !== 'object') {
			item = itemWrapper;
			item.$data = iterable[i];
		}
		item.$index = i;
		item['$parent'] = iterable;
		tpl(item);
		// tidy up
		//delete item.$index;
		//delete item.$parent;
	}
};
TAssembly.prototype.ctlFn_template = function(options, scope, cb) {
	// deal with options
	var data = this._evalExpr(options.data, scope);
	this.render(this._getTemplate(options.tpl), data, cb);
};

TAssembly.prototype.ctlFn_with = function(options, scope, cb) {
	var val = this._evalExpr(options.data, scope);
	if (val) {
		this.render(this._getTemplate(options.tpl), val, cb);
	} else {
		// TODO: hide the parent element similar to visible
	}
};

TAssembly.prototype.ctlFn_if = function(options, scope, cb) {
	if (this._evalExpr(options.data, scope)) {
		this.render(options.tpl, scope, cb);
	}
};

TAssembly.prototype.ctlFn_ifnot = function(options, scope, cb) {
	if (!this._evalExpr(options.data, scope)) {
		this.render(options.tpl, scope, cb);
	}
};

TAssembly.prototype.ctlFn_attr = function(options, scope, cb) {
	var self = this,
		attVal;
	Object.keys(options).forEach(function(name) {
		var attValObj = options[name];
		if (typeof attValObj === 'string') {
			attVal = self._evalExpr(options[name], scope);
		} else {
			// Must be an object
			attVal = attValObj.v || '';
			if (attValObj.app && Array.isArray(attValObj.app)) {
				attValObj.app.forEach(function(appItem) {
					if (appItem['if'] && self._evalExpr(appItem['if'], scope)) {
						attVal += appItem.v || '';
					}
					if (appItem.ifnot && ! self._evalExpr(appItem.ifnot, scope)) {
						attVal += appItem.v || '';
					}
				});
			}
			if (!attVal && attValObj.v === null) {
				attVal = null;
			}
		}
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
//TAssembly.prototype.ctlFn_text = function(options, scope, cb) {
//	cb(this._evalExpr(options, scope));
//};

TAssembly.prototype._xmlEncoder = function(c){
	switch(c) {
		case '<': return '&lt;';
		case '>': return '&gt;';
		case '&': return '&amp;';
		case '"': return '&quot;';
		default: return '&#' + c.charCodeAt() + ';';
	}
};

TAssembly.prototype._assemble = function(template, cb) {
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
			var ctlFn = bit[0],
				ctlOpts = bit[1];

			// Inline text and attr handlers for speed
			if (ctlFn === 'text') {
				code.push('val = ' + evalExprStub(ctlOpts) + ';'
					+ 'val = !val && val !== 0 ? "" : "" + val;'
					+ 'if(!/[<&]/.test(val)) { cb(val); }'
					+ 'else { cb(val.replace(/[<&]/g,this._xmlEncoder)); };');
			} else if ( ctlFn === 'attr' ) {
				var names = Object.keys(ctlOpts);
				for(var j = 0; j < names.length; j++) {
					var name = names[j];
					if (typeof ctlOpts[name] === 'string') {
						code.push('val = ' + evalExprStub(ctlOpts[name]) + ';');
					} else {
						// Must be an object
						var attValObj = ctlOpts[name];
						code.push('val=' + JSON.stringify(attValObj.v || ''));
						if (attValObj.app && Array.isArray(attValObj.app)) {
							attValObj.app.forEach(function(appItem) {
								if (appItem['if']) {
									code.push('if(' + evalExprStub(appItem['if']) + '){');
									code.push('val += ' + JSON.stringify(appItem.v || '') + ';');
									code.push('}');
								} else if (appItem.ifnot) {
									code.push('if(!' + evalExprStub(appItem.ifnot) + '){');
									code.push('val += ' + JSON.stringify(appItem.v || ''));
									code.push('}');
								}
							});
						}
						if (attValObj.v === null) {
							code.push('if(!val) { val = null; }');
						}
					}
					code.push("if (val !== null) { "
						// escape the attribute value
						// TODO: hook up context-sensitive sanitization for href,
						// src, style
						+ 'val = val || val === 0 ? val : "";'
						+ 'if(/[<&"]/.test(val)) { val = val.replace(/[<&"]/g,this._xmlEncoder); }'
						+ "cb(" + JSON.stringify(' ' + name + '="')
						+ " + val "
						+ "+ '\"');}");
				}
			} else {
				// Generic control function call

				// Store the args in the cache to a) keep the compiled code
				// small, and b) share compilations of sub-blocks between
				// repeated calls
				var uid = this._getUID();
				this.cache[uid] = ctlOpts;

				code.push('try {');
				// call the method
				code.push('this[' + JSON.stringify('ctlFn_' + ctlFn)
						// store in cache / unique key rather than here
						+ '](this.cache["' + uid + '"], scope, cb);');
				code.push('} catch(e) {');
				code.push("console.error('Unsupported control function:', "
						+ JSON.stringify(ctlFn) + ", e.stack);");
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

/**
 * Interpreted template expansion entry point
 *
 * @param {array} template The tassembly template in JSON IR
 * @param {object} scope the model
 * @param {function} cb (optional) chunk callback for bits of text (instead of
 * return)
 * @return {string} Rendered template string
 */
TAssembly.prototype.render = function(template, scope, cb) {
	var res;
	if (!cb) {
		res = [];
		cb = function(bit) {
			res.push(bit);
		};
	}

	// Just call a cached compiled version if available
	if (template.__cachedFn) {
		return template.__cachedFn.call(this, scope, cb);
	}

	var self = this,
		l = template.length;
	for(var i = 0; i < l; i++) {
		var bit = template[i],
			c = bit.constructor,
			val;
		if (c === String) {
			cb(bit);
		} else if (c === Array) {
			// control structure
			var ctlFn = bit[0],
				ctlOpts = bit[1];
			if (ctlFn === 'text') {
				val = this._evalExpr(ctlOpts, scope);
				if (!val && val !== 0) {
					val = '';
				}
				cb( ('' + val) // convert to string
						.replace(/[<&]/g, this._xmlEncoder)); // and escape
			} else {

				try {
					self['ctlFn_' + ctlFn](ctlOpts, scope, cb);
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


/**
 * Compile a template to a function
 *
 * @param {array} template The tassembly template in JSON IR
 * @param {function} cb (optional) chunk callback for bits of text (instead of
 * return)
 * @return {function} template function(model)
 */
TAssembly.prototype.compile = function(template, cb) {
	var self = this;
	if (template.__cachedFn) {
		//
		return function(scope) {
			return template.__cachedFn.call(self, scope, cb);
		};
	}
	var code = this._assemble(template, cb);
	//console.log(code);
	var fn = new Function('scope', 'cb', code);
	template.__cachedFn = fn;
	// bind this and cb
	var res = function (scope) {
		return fn.call(self, scope, cb);
	};
	return res;
};

module.exports = {
	TAssembly: TAssembly
};
