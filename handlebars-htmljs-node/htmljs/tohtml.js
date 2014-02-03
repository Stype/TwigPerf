
HTML.toHTML = function (node, parentComponent) {
  var res = '', cb = function(bit) { res += bit; };
  HTML._toHTML(node, parentComponent, cb);
  return res;
};
HTML._toHTML = function(node, parentComponent, cb) {
  if (node == null) {
    // null or undefined
    return cb('');
  } else if ((typeof node === 'string') || (typeof node === 'boolean') || (typeof node === 'number')) {
    // string; escape special chars
    return cb(HTML.escapeData(String(node)));
  } else if (node instanceof Array) {
    // array
    for (var i = 0; i < node.length; i++)
        HTML._toHTML(node[i], parentComponent, cb);
    return;
  } else if (typeof node.instantiate === 'function') {
    // component
    var instance = node.instantiate(parentComponent || null);
    var content = instance.render('STATIC');
    // recurse with a new value for parentComponent
    return HTML._toHTML(content, instance, cb);
  } else if (typeof node === 'function') {
    return HTML._toHTML(node(), parentComponent, cb);
  } else if (node._toHTML) {
    // Tag or something else
    return node._toHTML(parentComponent, cb);
  } else if (node.toHTML) {
    // Compatibility
    return cb(node.toHTML(parentComponent));
  } else {
    throw new Error("Expected tag, string, array, component, null, undefined, or " +
                    "object with a toHTML method; found: " + node);
  }
};

// backwards compatibility
HTML.Comment.prototype.toHTML =
HTML.CharRef.prototype.toHTML =
HTML.Raw.prototype.toHTML =
HTML.Tag.prototype.toHTML = function(parentComponent) {
  var res = '', cb = function(bit) { res += bit; };
  this._toHTML(parentComponent, cb);
  return res;
};

HTML.Comment.prototype._toHTML = function (_, cb) {
  cb('<!--');
  cb(this.sanitizedValue);
  cb('-->');
};

HTML.CharRef.prototype._toHTML = function (_, cb) {
  return cb(this.html);
};

HTML.Raw.prototype._toHTML = function (_, cb) {
  return cb(this.value);
};

HTML.Tag.prototype._toHTML = function (parentComponent, cb) {
  var tagName = this.tagName;
  cb('<');
  cb(HTML.properCaseTagName(tagName));

  var attrs = this.evaluateAttributes(parentComponent);
  if (attrs) {
    for (var k in attrs) {
      var v = attrs[k];
      k = HTML.properCaseAttributeName(k);
      cb(' '); cb(k); cb('="');
      HTML._toText(v, HTML.TEXTMODE.ATTRIBUTE, parentComponent, cb);
      cb('"');
    }
  }
  cb('>');

  if (tagName === 'TEXTAREA') {
    // TEXTAREA absorbs the first newline
    cb('\n');
    for (var i = 0; i < this.children.length; i++)
      HTML._toText(this.children[i], HTML.TEXTMODE.RCDATA, parentComponent, cb);
  } else {
    for (var i = 0; i < this.children.length; i++)
      HTML._toHTML(this.children[i], parentComponent, cb);
  }

  if (this.children.length || ! HTML.isVoidElement(tagName)) {
    // "Void" elements like BR are the only ones that don't get a close
    // tag in HTML5.  They shouldn't have contents, either, so we could
    // throw an error upon seeing contents here.
    cb('</'); cb(HTML.properCaseTagName(tagName)); cb('>');
  }
};

HTML.TEXTMODE = {
  ATTRIBUTE: 1,
  RCDATA: 2,
  STRING: 3
};

HTML.toText = function (node, textMode, parentComponent) {
  var res = '', cb = function(bit) { res += bit; };
  HTML._toText(node, textMode, parentComponent, cb);
  return res;
};

HTML._toText = function (node, textMode, parentComponent, cb) {
  if (node == null) {
    // null or undefined
    return cb('');
  } else if ((typeof node === 'string') || (typeof node === 'boolean') || (typeof node === 'number')) {
    node = String(node);
    // string
    if (textMode === HTML.TEXTMODE.STRING) {
      return cb(node);
    } else if (textMode === HTML.TEXTMODE.RCDATA) {
      return cb(HTML.escapeData(node));
    } else if (textMode === HTML.TEXTMODE.ATTRIBUTE) {
      // escape `&` and `"` this time, not `&` and `<`
      return cb(node.replace(/&/g, '&amp;').replace(/"/g, '&quot;'));
    } else {
      throw new Error("Unknown TEXTMODE: " + textMode);
    }
  } else if (node instanceof Array) {
    // array
    for (var i = 0; i < node.length; i++)
      HTML._toText(node[i], textMode, parentComponent, cb);
    return;
  } else if (typeof node === 'function') {
    return HTML._toText(node(), textMode, parentComponent, cb);
  } else if (typeof node.instantiate === 'function') {
    // component
    var instance = node.instantiate(parentComponent || null);
    var content = instance.render('STATIC');
    return HTML._toText(content, textMode, instance, cb);
  } else if (node._toText) {
    // Something else
    return node._toText(textMode, parentComponent, cb);
  } else if (node.toText) {
    // Compatibility
    return cb(node.toText(textMode, parentComponent));
  } else {
    throw new Error("Expected tag, string, array, component, null, undefined, or " +
                    "object with a toText method; found: " + node);
  }

};

// backwards compatibility
HTML.CharRef.prototype.toText =
HTML.Raw.prototype.toText =
HTML.Tag.prototype.toText = function(textMode, parentComponent) {
  var res = '', cb = function(bit) { res += bit; };
  this._toText(textMode, parentComponent, cb);
  return res;
};

HTML.Raw.prototype._toText = function (textMode, parentComponent, cb) {
  return cb(this.value);
};

// used when including templates within {{#markdown}}
HTML.Tag.prototype._toText = function (textMode, parentComponent, cb) {
  if (textMode === HTML.TEXTMODE.STRING)
    // stringify the tag as HTML, then convert to text
    return HTML._toText(
      this.toHTML(parentComponent), textMode, parentComponent, cb
    );
  else
    throw new Error("Can't insert tags in attributes or TEXTAREA elements");
};

HTML.CharRef.prototype._toText = function (textMode, parentComponent, cb) {
  if (textMode === HTML.TEXTMODE.STRING)
    return cb(this.str);
  else if (textMode === HTML.TEXTMODE.RCDATA)
    return cb(this.html);
  else if (textMode === HTML.TEXTMODE.ATTRIBUTE)
    return cb(this.html);
  else
    throw new Error("Unknown TEXTMODE: " + textMode);
};

/* Build optimized versions of the Tag.prototype.toHTML functions */
(function() {
  var mkFastToHTML = function(tagName) {
    tagName = tagName.toUpperCase();
    var source1 = [
      "var k,v,i;",
      "cb('<" + HTML.properCaseTagName(tagName) + "');",
      "var attrs = this.evaluateAttributes(parentComponent);",
      "if (attrs) {",
      "  for (k in attrs) {",
      "    var v = attrs[k];",
      "    k = HTML.properCaseAttributeName(k);",
      "    cb(' '); cb(k); cb('=\"');",
      "    HTML._toText(v, "+HTML.TEXTMODE.ATTRIBUTE+", parentComponent, cb);",
      "    cb('\"');",
      "  }",
      "}",
      "cb('>');"
    ].join('\n');
    var source2 = [
      "for (i = 0; i < this.children.length; i++) {",
      "  HTML._toHTML(this.children[i], parentComponent, cb);",
      "}",
      "cb('</"+HTML.properCaseTagName(tagName) + ">');"
    ].join('\n');

    var source = source1;
    if (!HTML.isVoidElement(tagName)) {
      source += '\n' + source2;
    }

    var fun = new Function('parentComponent', 'cb', source);
    if (tagName !== 'TEXTAREA') {
      HTML[tagName].prototype._toHTML = fun;
    }
  };

  for (var i = 0; i < HTML.knownElementNames.length; i++)
    mkFastToHTML(HTML.knownElementNames[i]);
})();
