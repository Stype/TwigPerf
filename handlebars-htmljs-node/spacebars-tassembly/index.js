// Hook up the Spacebars compiler to QuickTemplate's JSON IR
// (instead of to htmljs)
var HTML = require('../html-tools');
var Spacebars = require('../spacebars-compiler');
var ta = require('../../knockoff-node/node_modules/knockoff/node_modules/tassembly/tassembly');

HTML.toQT = function(node, parentComponent) {
	var result = [];
	HTML._toQT(node, parentComponent, result);
	return result;
};
HTML._toQT = function(node, parentComponent, result) {
	if (node == null) {
		return;
	} else if ((typeof node === 'string') || (typeof node === 'boolean') ||
	           (typeof node === 'number')) {
		return result.push(String(node)); // QT will take care of escaping
	} else if (node instanceof Array) {
		// array
		for (var i = 0; i < node.length; i++) {
			HTML._toQT(node[i], parentComponent, result);
		}
		return;
	} else if (typeof node.instantiate === 'function') {
		// component
		var instance = node.instantiate(parentComponent || null);
		var content = instance.render('STATIC');
		// recurse with a new value for parentComponent
		return HTML._toQT(content, instance, result);
	} else if (typeof node === 'function') {
		return HTML._toQT(node(), parentComponent, result);
	} else if (node._toQT) {
		// Tag or something else
		return node._toQT(parentComponent, result);
	} else {
		throw new Error("Expected tag, string, array, component, null, undefined,"+
		                " or object with a _toQT method; found: " + node);
	}
};

HTML.Comment.prototype._toQT = function(_, result) {
	result.push('<!--' + this.sanitizedValue + '-->');
};
HTML.CharRef.prototype._toQT = function(_, result) {
	result.push(this.html);
};
HTML.Raw.prototype._toQT = function(_, result) {
	result.push(this.value);
};
HTML.Tag.prototype._toQT = function(parentComponent, result) {
	var tagName = this.tagName;
	result.push('<' + HTML.properCaseTagName(tagName));
	var attrs = this.evaluateAttributes(parentComponent);
	if (attrs) {
		var a = {};
		for (var k in attrs) {
			var v = attrs[k];
			k = HTML.properCaseAttributeName(k);
			console.assert(v instanceof HTML.Special);
			console.assert(v.value.type === 'DOUBLE');
			a[k] = codeGenPath(v.value.path); // XXX HACK
		}
		result.push(['attr', a]);
	}
	result.push('>');
	// XXX handle TEXTAREA
	for (var i = 0; i < this.children.length; i++) {
		HTML._toQT(this.children[i], parentComponent, result);
	}

	if (this.children.length || ! HTML.isVoidElement(tagName)) {
		// "Void" elements like BR are the only ones that don't get a close
		// tag in HTML5.  They shouldn't have contents, either, so we could
		// throw an error upon seeing contents here.
		result.push('</'+HTML.properCaseTagName(tagName)+'>');
	}
};

var codeGenPath = function(path) {
	if (path.length > 1) { throw new Error('unimplemented'); }
	// Assume that all paths reference the model for now
	return 'm.' + path[0];
};

// returns: array of source strings, or null if no
// args at all.
var codeGenArgs = function (tagArgs) {
	if (tagArgs.length > 0) { throw new Error('unimplemented'); }
	return null;
};

var codeGenMustache = function(tag, parentComponent, mustacheType, result) {
	var nameCode = codeGenPath(tag.path);
	var argCode = codeGenArgs(tag.args);
	var mustache = (mustacheType || 'mustache');
	result.push(['text',nameCode]);
};

var builtInComponents = {
	'content': '__content',
	'elseContent': '__elseContent',
	'if': 'UI.If',
	'unless': 'UI.Unless',
	'with': 'UI.With',
	'each': 'UI.Each'
};

var codeGenTemplateTag = function(tag, parentComponent, result) {
	if (tag.position === HTML.TEMPLATE_TAG_POSITION.IN_START_TAG) {
		// only `tag.type === 'DOUBLE'` allowed (by earlier validation)
		throw new Error('1');
		/*
			return HTML.EmitCode('function () { return ' +
			codeGenMustache(tag, 'attrMustache') + '; }');
		*/
	} else {
		if (tag.type === 'DOUBLE') {
			codeGenMustache(tag, parentComponent, null, result);
			/*
				return HTML.EmitCode('function () { return ' +
				codeGenMustache(tag) + '; }');
			*/
		} else if (tag.type === 'TRIPLE') {
			throw new Error('3');
			/*
				return HTML.EmitCode('function () { return Spacebars.makeRaw(' +
				codeGenMustache(tag) + '); }');
			*/
		} else if (tag.type === 'INCLUSION' || tag.type === 'BLOCKOPEN') {
			var path = tag.path;
			var compCode = codeGenPath(path);

			if (path.length === 1) {
				var compName = path[0];
				if (compName === 'each') { // HACK HACK HACK
					var tpl = HTML.toQT(tag.content, parentComponent); // NOT QUITE RIGHT
					var data = tag.args[0];
					var argType = data[0], argValue = data[1];
					console.assert(argType==='PATH');
					data = codeGenPath(argValue);
					result.push(['foreach',{data:data,tpl:tpl}]);
					return;
				}
				if (builtInComponents.hasOwnProperty(compName)) {
					compCode = builtInComponents[compName];
				} else {
					// toObjectLiteralKey returns `"foo"` or `foo` depending on
					// whether `foo` is a safe JavaScript identifier.
					var member = toObjectLiteralKey(path[0]);
					var templateDotFoo = (member.charAt(0) === '"' ?
																'Template[' + member + ']' :
																'Template.' + member);
					compCode = ('(' + templateDotFoo + ' || ' + compCode + ')');
				}
			}

			var includeArgs = codeGenInclusionArgs(tag);

			return HTML.EmitCode(
				'function () { return Spacebars.include(' + compCode +
					(includeArgs.length ? ', ' + includeArgs.join(', ') : '') +
					'); }');
		} else {
			// Can't get here; TemplateTag validation should catch any
			// inappropriate tag types that might come out of the parser.
			throw new Error("Unexpected template tag type: " + tag.type);
		}
	}
};

HTML.Special.prototype._toQT = function(parentComponent, result) {
	codeGenTemplateTag(this.value, parentComponent, result);
};

var SBQT = {};

SBQT.codeGen = function(tree) {
	//console.log(JSON.stringify(tree));
	return HTML.toQT(tree);
};

SBQT.compile = function(handlebars_template) {
	var tree = Spacebars.parse(handlebars_template);
	var template = SBQT.codeGen(tree);
	//console.log(JSON.stringify(template));
	return ta.compile(template);
};

module.exports = SBQT;
