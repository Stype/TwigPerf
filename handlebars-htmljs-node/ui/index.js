// Some glue lifted from the meteor ui package found at
// https://github.com/meteor/meteor/tree/shark/packages/ui
// but hacked to pieces to remove reactivity and other unnecessary features.

var _ = require('../miniu');
var HTML = require('../html-tools');

// ----------- from base.js ---------------------------
var UI = {};

var sanitizeTypeName = function (typeName) {
  return String(typeName).replace(/^[^a-zA-Z_]|[^a-zA-Z_0-9]+/g,
                                  '') || 'Component';
};

UI.Component = (function(constr) {
  var C = new constr;
  Object.defineProperty(C, '_constr', {value: constr});
  Object.defineProperty(C, '_super', {value: null});
  return C;
})(function Component() {});
UI.Component._type = 'Component';
UI.Component.kind = 'Component';
UI.Component.withData = function(data) {
  return this.extend({data: data});
};
UI.Component.extend = function(props) {
  var constr;
  var constrMade = false;
  // Any Component with a kind of "Foo" (say) is given
  // a `._constr` of the form `function Foo() {}`.
  if (props && props.kind) {
    constr = Function("return function " +
                      sanitizeTypeName(props.kind) +
                      "() {};")();
    constrMade = true;
  } else {
    constr = this._constr;
  }

  // We don't know where we're getting `constr` from --
  // it might be from some supertype -- just that it has
  // the right function name.  So set the `prototype`
  // property each time we use it as a constructor.
  constr.prototype = this;

  var c = new constr;
  if (constrMade)
    c._constr = constr;

  if (props) {
    for (var k in props) {
      if (props.hasOwnProperty(k)) {
        c[k] = props[k];
      }
    }
  }

  // for efficient Component instantiations, we assign
  // as few things as possible here.
  Object.defineProperty(c, '_super', {value: this});
  return c;
};

var findComponentWithProp = function (id, comp) {
  while (comp) {
    if (typeof comp[id] !== 'undefined')
      return comp;
    comp = comp.parent;
  }
  return null;
};

var getComponentData = function (comp) {
  comp = findComponentWithProp('data', comp);
  return (comp ?
          (typeof comp.data === 'function' ?
           comp.data() : comp.data) :
          null);
};

// ------- from render.js ---------
UI.Component.instantiate = function(parent) {
  var kind = this;
  var inst = kind.extend();
  inst.isInited = true;
  inst.parent = (parent || null);
  if (inst.init) { inst.init(); }
  return inst;
};
UI.Component.render = function() { return null; };
UI.isComponent = function(obj) { return obj && obj._type === 'Component'; };
UI.emboxValue = function(funcOrValue, equals) {
  if (typeof funcOrValue === 'function') {
    return funcOrValue();
  } else {
    return funcOrValue;
  }
};
UI.body = UI.Component.extend({
  kind: 'body',
  contentParts: [],
  render: function () {
    return this.contentParts;
  },
});
UI.block = function(renderFunc) {
  return UI.Component.extend({ render: renderFunc });
};
UI.toHTML = function (content, parentComponent) {
  return HTML.toHTML(content, parentComponent);
};

// ----------- from each.js ---------------------------
UI.Each = UI.Component.extend({
  kind: 'Each',
  init: function() {
    // ensure the `{{..}}` skips over this component.
    this.sequence = this.data;
    this.data = undefined;
  },
  render: function(modeHint) {
    var self = this;
    var content = self.__content;
    var elseContent = self.__elseContent;
    var parts = _.map(this.sequence, function(item) {
      return content.withData(item);
    });
    return (parts.length) ? parts : elseContent;
  }
});

// ----------- from components.js ---------------

// Acts like `!! self.condition()` except:
//
// - Empty array is considered falsy
var getCondition = function (self) {
  var cond = self.get('condition');

  // empty arrays are treated as falsey values
  if (cond instanceof Array && cond.length === 0)
    return false;
  else
    return !! cond;
};

UI.If = UI.Component.extend({
  kind: 'If',
  init: function () {
    this.condition = this.data;
    this.data = undefined;
  },
  render: function () {
    var self = this;
    var condition = getCondition(self);
    return condition ? self.__content : self.__elseContent;
  }
});

UI.Unless = UI.Component.extend({
  kind: 'Unless',
  init: function () {
    this.condition = this.data;
    this.data = undefined;
  },
  render: function () {
    var self = this;
    var condition = getCondition(self);
    return (! condition) ? self.__content : self.__elseContent;
  }
});

UI.With = UI.Component.extend({
  kind: 'With',
  init: function () {
    this.condition = this.data;
  },
  render: function () {
    var self = this;
    var condition = getCondition(self);
    return condition ? self.__content : self.__elseContent;
  }
});

// ----------- from handlebars_backcompat.js
var Handlebars = {
  _globalHelpers: {},

  registerHelper: function (name, func) {
    this._globalHelpers[name] = func;
  }
};

// Utility to HTML-escape a string.
Handlebars._escape = (function() {
  var escape_map = {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;", /* IE allows backtick-delimited attributes?? */
    "&": "&amp;"
  };
  var escape_one = function(c) {
    return escape_map[c];
  };

  return function (x) {
    return x.replace(/[&<>"'`]/g, escape_one);
  };
})();

// Return these from {{...}} helpers to achieve the same as returning
// strings from {{{...}}} helpers
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

// ----------- from fields.js ---------------------------

// Searches for the given property in `comp` or a parent,
// and returns it as is (without call it if it's a function).
var lookupComponentProp = function (comp, prop) {
  comp = findComponentWithProp(prop, comp);
  var result = (comp ? comp.data : null);
  if (typeof result === 'function')
    result = result.bind(comp);
  return result;
};

// Component that's a no-op when used as a block helper like
// `{{#foo}}...{{/foo}}`.
var noOpComponent = UI.Component.extend({
  kind: 'NoOp',
  render: function () {
    return this.__content;
  }
});

// This map is searched first when you do something like `{{#foo}}` in
// a template.
var builtInComponents = {
  // for past compat:
  'constant': noOpComponent,
  'isolate': noOpComponent
};

UI.Component.lookup = function (id) {
  var self = this;
  var result;
  var comp;

  if (!id)
    throw new Error("must pass id to lookup");

  if (/^\./.test(id)) {
    // starts with a dot. must be a series of dots which maps to an
    // ancestor of the appropriate height.
    if (!/^(\.)+$/.test(id)) {
      throw new Error("id starting with dot must be a series of dots");
    }

    var compWithData = findComponentWithProp('data', self);
    for (var i = 1; i < id.length; i++) {
      compWithData = compWithData ? findComponentWithProp('data', compWithData.parent) : null;
    }

    return (compWithData ? compWithData.data : null);

  } else if ((comp = findComponentWithProp(id, self))) {
    // found a property or method of a component
    // (`self` or one of its ancestors)
    var result = comp[id];

  } else if (_.has(builtInComponents, id)) {
    return builtInComponents[id];
  } else if (Handlebars._globalHelpers[id]) {
    // Backwards compatibility for helpers defined with
    // `Handlebars.registerHelper`. XXX what is the future pattern
    // for this? We should definitely not put it on the Handlebars
    // namespace.
    result = Handlebars._globalHelpers[id];
  } else {
    // Resolve id `foo` as `data.foo` (with a "soft dot").
    return function (/*arguments*/) {
      var data = getComponentData(self);
      if (! data)
        return data;
      var result = data[id];
      if (typeof result === 'function')
        return result.apply(data, arguments);
      return result;
    };
  }

  if (typeof result === 'function' &&! result._isEmboxedConstant) {
    // Wrap the function `result`, binding `this` to `getComponentData(self)`.
    // This creates a dependency when the result function is called.
    // Don't do this if the function is really just an emboxed constant.
    return function (/*arguments*/) {
      var data = getComponentData(self);
      return result.apply(data, arguments);
    };
  } else {
    return result;
  };
};

UI.Component.get = function (id) {
  // support `this.get()` to get the data context.
  if (id === undefined)
    id = ".";

  var result = this.lookup(id);
  return (typeof result === 'function' ? result() : result);
};

UI.Component.set = function(id, value) {
  var comp = findComponentWithProp(id, this);
  if (! comp || ! comp[id])
    throw new Error("Can't find field: " + id);
  if (typeof comp[id] !== 'function')
    throw new Error("Not a settable field: " + id);
  comp[id](value);
};

// -- export! --
UI.Handlebars = Handlebars;
module.exports = UI;
