
// Tag instances are `instanceof HTML.Tag`.
//
// This is a private constructor.  Internally, we set
// `HTML.P.prototype = new HTML.Tag("P")`.
HTML.Tag = function (tagName) {
  this.tagName = tagName;
  this.attrs = null;
  this.children = [];
};

// Call all functions and instantiate all components, when fine-grained
// reactivity is not needed (for example, in attributes).
HTML.evaluate = function (node, parentComponent) {
  if (node == null) {
    return node;
  } else if (typeof node === 'function') {
    return HTML.evaluate(node(), parentComponent);
  } else if (node instanceof Array) {
    var result = [];
    for (var i = 0; i < node.length; i++)
      result.push(HTML.evaluate(node[i], parentComponent));
    return result;
  } else if (typeof node.instantiate === 'function') {
    // component
    var instance = node.instantiate(parentComponent || null);
    var content = instance.render('STATIC');
    return HTML.evaluate(content, instance);
  }  else if (node instanceof HTML.Tag) {
    var newChildren = [];
    for (var i = 0; i < node.children.length; i++)
      newChildren.push(HTML.evaluate(node.children[i], parentComponent));
    var newTag = HTML.getTag(node.tagName).apply(null, newChildren);
    newTag.attrs = {};
    for (var k in node.attrs)
      newTag.attrs[k] = HTML.evaluate(node.attrs[k], parentComponent);
    return newTag;
  } else {
    return node;
  }
};

var extendAttrs = function (tgt, src, parentComponent) {
  for (var k in src) {
    if (k === '$dynamic')
      continue;
    if (! HTML.isValidAttributeName(k))
      throw new Error("Illegal HTML attribute name: " + k);
    var value = HTML.evaluate(src[k], parentComponent);
    if (! HTML.isNully(value))
      tgt[k] = value;
  }
};

// Process the `attrs.$dynamic` directive, if present, returning the final
// attributes dictionary.  The value of `attrs.$dynamic` must be an array
// of attributes dictionaries or functions returning attribute dictionaries.
// These attributes are used to extend `attrs` as long as they are non-nully.
// All attributes are "evaluated," calling functions and instantiating
// components.
HTML.evaluateAttributes = function (attrs, parentComponent) {
  if (! attrs)
    return attrs;

  var result = {};
  extendAttrs(result, attrs, parentComponent);

  if ('$dynamic' in attrs) {
    if (! (attrs.$dynamic instanceof Array))
      throw new Error("$dynamic must be an array");
    // iterate over attrs.$dynamic, calling each element if it
    // is a function and then using it to extend `result`.
    var dynamics = attrs.$dynamic;
    for (var i = 0; i < dynamics.length; i++) {
      var moreAttrs = dynamics[i];
      if (typeof moreAttrs === 'function')
        moreAttrs = moreAttrs();
      extendAttrs(result, moreAttrs, parentComponent);
    }
  }

  return result;
};

HTML.Tag.prototype.evaluateAttributes = function (parentComponent) {
  return HTML.evaluateAttributes(this.attrs, parentComponent);
};

// Given "P" create the function `HTML.P`.
var makeTagConstructor = function (tagName) {
  // Do a little dance so that tags print nicely in the Chrome console.
  // First make tag name suitable for insertion into evaluated JS code,
  // for security reasons mainly.
  var sanitizedName = String(tagName).replace(
      /^[^a-zA-Z_]|[^a-zA-Z_0-9]/g, '_') || 'Tag';

  // Generate a constructor function whose name is the tag name.
  // We try to choose generic-sounding variable names in case V8 infers
  // them as type names and they show up in the developer console.
  // HTMLTag is the constructor function for our specific tag type.
  var HTMLTag = (new Function(
    '_constructTag',
    'var Tag; return (Tag = function ' +
      sanitizedName + '_Tag(/*arguments*/) { ' +
      'return _constructTag(Tag, this, arguments); });'))(_constructTag);

  HTMLTag.prototype = new HTML.Tag(tagName);
  HTMLTag.prototype.constructor = HTMLTag;

  return HTMLTag;
};

// Given "P", create and assign `HTML.P` if it doesn't already exist.
// Then return it.
HTML.getTag = function (tagName) {
  tagName = tagName.toUpperCase();

  if (! HTML[tagName])
    HTML[tagName] = makeTagConstructor(tagName);

  return HTML[tagName];
};

// Given "P", make sure `HTML.P` exists.
HTML.ensureTag = function (tagName) {
  HTML.getTag(tagName); // don't return it
};

// When you call either `HTML.P(...)` or `new HTML.P(...)`,
// this function handles the actual implementation.
var _constructTag = function (constructor, instance, args) {
  if (! (instance instanceof HTML.Tag)) {
    // If you called `HTML.P(...)` without `new`, we don't actually
    // have an instance in `this`.  Create one by calling `new HTML.P`
    // with no arguments (which will invoke `_constructTag` reentrantly,
    // but doing essentially nothing).
    instance = new constructor;
  }

  var i = 0;
  var attrs = (args.length && args[0]);
  if (attrs && (typeof attrs === 'object') &&
      (attrs.constructor === Object)) {
    instance.attrs = attrs;
    i++;
  }
  instance.children = Array.prototype.slice.call(args, i);

  return instance;
};

HTML.CharRef = function (attrs) {
  if (! (this instanceof HTML.CharRef))
    // called without `new`
    return new HTML.CharRef(attrs);

  if (! (attrs && attrs.html && attrs.str))
    throw new Error(
      "HTML.CharRef must be constructed with ({html:..., str:...})");

  this.html = attrs.html;
  this.str = attrs.str;
};

HTML.Comment = function (value) {
  if (! (this instanceof HTML.Comment))
    // called without `new`
    return new HTML.Comment(value);

  if (typeof value !== 'string')
    throw new Error('HTML.Comment must be constructed with a string');

  this.value = value;
  // Kill illegal hyphens in comment value (no way to escape them in HTML)
  this.sanitizedValue = value.replace(/^-|--+|-$/g, '');
};

HTML.Raw = function (value) {
  if (! (this instanceof HTML.Raw))
    // called without `new`
    return new HTML.Raw(value);

  if (typeof value !== 'string')
    throw new Error('HTML.Raw must be constructed with a string');

  this.value = value;
};

HTML.EmitCode = function (value) {
  if (! (this instanceof HTML.EmitCode))
    // called without `new`
    return new HTML.EmitCode(value);

  if (typeof value !== 'string')
    throw new Error('HTML.EmitCode must be constructed with a string');

  this.value = value;
};

HTML.isTagEnsured = function (t) {
  return HTML.isKnownElement(t) || HTML.isKnownSVGElement(t);
};

(function () {
  for (var i = 0; i < HTML.knownElementNames.length; i++)
    HTML.ensureTag(HTML.knownElementNames[i]);

  for (var i = 0; i < HTML.knownSVGElementNames.length; i++)
    HTML.ensureTag(HTML.knownSVGElementNames[i]);
})();
