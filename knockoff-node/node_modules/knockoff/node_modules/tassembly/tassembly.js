/*
 * JSON template IR runtime
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
			+ '(?:\\((?:[0-9a-zA-Z_$.]+|["\'][a-zA-Z0-9_$\\.]+["\'])\\))?'
			+ ')+$'),
	simpleBindingVar = /^(m|p|p[sc]?|rm|i|c)\.([a-zA-Z_$]+)$/;

// Rewrite an expression so that it is referencing the context where necessary
function rewriteExpression (expr) {
	// Rewrite the expression to be keyed on the context 'c'
	// XXX: experiment with some local var definitions and selective
	// rewriting for perf

	var res = '',
		i = -1,
		c = '';
	do {
		if (/^$|[\[:(]/.test(c)) {
			res += c;
			if (/[pri]/.test(expr[i+1])
				&& /(?:p[sc]?|rm|i)(?:[\.\)\]}]|$)/.test(expr.slice(i+1))) {
				// Prefix with full context object; only the local view model
				// 'm' and the context 'c' is defined locally for now
				res += 'c.';
			}
		} else if (c === "'") {
			// skip over string literal
			var literal = expr.slice(i).match(/'(?:[^\\']+|\\')*'/);
			if (literal) {
				res += literal[0];
				i += literal[0].length - 1;
			}
		} else {
			res += c;
		}
		i++;
		c = expr[i];
	} while (c);
	return res;
}

TAssembly.prototype._evalExpr = function (expression, ctx) {
	var func = this.cache['expr' + expression];
	if (!func) {

		var simpleMatch = expression.match(simpleBindingVar);
		if (simpleMatch) {
			var ctxMember = simpleMatch[1],
				key = simpleMatch[2];
			return ctx[ctxMember][key];
		}

		// String literal
		if (/^'.*'$/.test(expression)) {
			return expression.slice(1,-1).replace(/\\'/g, "'");
		}

		func = new Function('c', 'var m = c.m;'
				+ 'return ' + rewriteExpression(expression));
		this.cache['expr' + expression] = func;
	}
	if (func) {
		try {
			return func(ctx);
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
 * Directly dereference the ctx for simple expressions (the common case),
 * and fall back to the full method otherwise.
 */
function evalExprStub(expr) {
	expr = '' + expr;
	var newExpr;
	if (simpleBindingVar.test(expr)) {
		newExpr = rewriteExpression(expr);
		return newExpr;
	} else if (/^'/.test(expr)) {
		// String literal
		return JSON.stringify(expr.slice(1,-1).replace(/\\'/g, "'"));
	} else if (/[cm]\.?[a-zA-Z_$]*$/.test(expr)) {
		// Simple context or model reference
		return expr;
	} else {
		newExpr = rewriteExpression(expr);
		return '(function() { '
			+ 'try {'
			+ 'return ' + newExpr + ';'
			+ '} catch (e) { console.error(e); return "";}})()';
	}
}

TAssembly.prototype._getTemplate = function (tpl, cb) {
	if (Array.isArray(tpl)) {
		return tpl;
	} else {
		// String literal: strip quotes
		if (/^'/.test(tpl)) {
			tpl = tpl.slice(1,-1).replace(/\\'/g, "'");
		}
		return this.partials[tpl];
	}
};

TAssembly.prototype.ctlFn_foreach = function(options, ctx, cb) {
	// deal with options
	var iterable = this._evalExpr(options.data, ctx);
	if (!iterable || !Array.isArray(iterable)) { return; }
		// worth compiling the nested template
	var tpl = this.compile(this._getTemplate(options.tpl), cb),
		l = iterable.length,
		newCtx = this.childContext(null, ctx);
	for(var i = 0; i < l; i++) {
		// Update the view model for each iteration
		newCtx.m = iterable[i];
		newCtx.ps[0] = iterable[i];
		// And set the iteration index
		newCtx.i = i;
		tpl(newCtx);
	}
};
TAssembly.prototype.ctlFn_template = function(options, ctx, cb) {
	// deal with options
	var model = this._evalExpr(options.data, ctx),
		newCtx = this.childContext(model, ctx),
		tpl = this._getTemplate(options.tpl);
	if (tpl) {
		this.render(tpl, newCtx, cb);
	}
};

TAssembly.prototype.ctlFn_with = function(options, ctx, cb) {
	var model = this._evalExpr(options.data, ctx),
		tpl = this._getTemplate(options.tpl);
	if (model && tpl) {
		var newCtx = this.childContext(model, ctx);
		this.render(tpl, newCtx, cb);
	} else {
		// TODO: hide the parent element similar to visible
	}
};

TAssembly.prototype.ctlFn_if = function(options, ctx, cb) {
	if (this._evalExpr(options.data, ctx)) {
		this.render(options.tpl, ctx, cb);
	}
};

TAssembly.prototype.ctlFn_ifnot = function(options, ctx, cb) {
	if (!this._evalExpr(options.data, ctx)) {
		this.render(options.tpl, ctx, cb);
	}
};

TAssembly.prototype.ctlFn_attr = function(options, ctx, cb) {
	var self = this,
		attVal;
	Object.keys(options).forEach(function(name) {
		var attValObj = options[name];
		if (typeof attValObj === 'string') {
			attVal = self._evalExpr(options[name], ctx);
		} else {
			// Must be an object
			attVal = attValObj.v || '';
			if (attValObj.app && Array.isArray(attValObj.app)) {
				attValObj.app.forEach(function(appItem) {
					if (appItem['if'] && self._evalExpr(appItem['if'], ctx)) {
						attVal += appItem.v || '';
					}
					if (appItem.ifnot && ! self._evalExpr(appItem.ifnot, ctx)) {
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
//TAssembly.prototype.ctlFn_text = function(options, ctx, cb) {
//	cb(this._evalExpr(options, ctx));
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

TAssembly.prototype.Context = function(model, parentContext) {
	this.m = model;
	this.c = this;
	if (parentContext) {
		this.ps = [model].concat(parentContext.ps);
		this.p = parentContext.m;
		this.pc = parentContext;
		this.rm = parentContext.rm;
	} else {
		this.ps = [model];
		this.rm = model;
	}
};

TAssembly.prototype.childContext = function (model, parCtx) {
	return {
		m: model,
		p: parCtx.m,
		ps: [model].concat(parCtx.ps),
		rm: parCtx.rm
	};
};

TAssembly.prototype._assemble = function(template, cb) {
	var code = [],
		cbExpr = [];

	function pushCode(codeChunk) {
		if(cbExpr.length) {
			code.push('cb(' + cbExpr.join('+') + ');');
			cbExpr = [];
		}
		code.push(codeChunk);
	}

	code.push('var val;');
	if (!cb) {
		// top-level template: set up accumulator
		code.push('var res = "", cb = function(bit) { res += bit; };');
		// and the top context
		code.push('var m = c;');
		code.push('c = { rm: m, m: m, ps: [c]};');
	} else {
		code.push('var m = c.m;');
	}

	var self = this,
		l = template.length;
	for(var i = 0; i < l; i++) {
		var bit = template[i],
			c = bit.constructor;
		if (c === String) {
			// static string
			cbExpr.push(JSON.stringify(bit));
		} else if (c === Array) {
			// control structure
			var ctlFn = bit[0],
				ctlOpts = bit[1];

			// Inline text and attr handlers for speed
			if (ctlFn === 'text') {
				pushCode('val = ' + evalExprStub(ctlOpts) + ';\n'
					// convert val to string
					+ 'val = val || val === 0 ? "" + val : "";\n'
					+ 'if(/[<&]/.test(val)) { val = val.replace(/[<&]/g,this._xmlEncoder); }\n');
				cbExpr.push('val');
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
					pushCode("if (val !== null) { "
						// escape the attribute value
						// TODO: hook up context-sensitive sanitization for href,
						// src, style
						+ '\nval = val || val === 0 ? "" + val : "";'
						+ '\nif(/[<&"]/.test(val)) { val = val.replace(/[<&"]/g,this._xmlEncoder); }'
						+ "\ncb(" + JSON.stringify(' ' + name + '="')
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

				pushCode('try {');
				// call the method
				code.push('this[' + JSON.stringify('ctlFn_' + ctlFn)
						// store in cache / unique key rather than here
						+ '](this.cache["' + uid + '"], c, cb);');
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
		pushCode("return res;");
	} else {
		// Force out the cb
		pushCode("");
	}
	return code.join('\n');
};

/**
 * Interpreted template expansion entry point
 *
 * @param {array} template The tassembly template in JSON IR
 * @param {object} c the model or context
 * @param {function} cb (optional) chunk callback for bits of text (instead of
 * return)
 * @return {string} Rendered template string
 */
TAssembly.prototype.render = function(template, ctx_or_model, cb) {
	var res, ctx;
	if (!cb) {
		res = [];
		cb = function(bit) {
			res.push(bit);
		};
		// c is really the model. Wrap it into a context.
		ctx = { rm: ctx_or_model, m: ctx_or_model, ps: [ctx_or_model]};
	} else {
		ctx = ctx_or_model;
	}

	// Just call a cached compiled version if available
	if (template.__cachedFn) {
		return template.__cachedFn.call(this, ctx, cb);
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
				val = this._evalExpr(ctlOpts, ctx);
				if (!val && val !== 0) {
					val = '';
				}
				cb( ('' + val) // convert to string
						.replace(/[<&]/g, this._xmlEncoder)); // and escape
			} else {

				try {
					self['ctlFn_' + ctlFn](ctlOpts, ctx, cb);
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
		return function(ctx) {
			return template.__cachedFn.call(self, ctx, cb);
		};
	}
	var code = this._assemble(template, cb);
	//console.log(code);
	var fn = new Function('c', 'cb', code);
	template.__cachedFn = fn;
	// bind this and cb
	var res = function (ctx) {
		return fn.call(self, ctx, cb);
	};
	return res;
};

module.exports = {
	TAssembly: TAssembly
};
