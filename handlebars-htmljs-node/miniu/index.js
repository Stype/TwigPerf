// A miniature 'underscore' implementation, with just those methods used
// by Spacebars.

var _ = {};

(function() {
  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  var ArrayProto = Array.prototype, ObjProto = Object.prototype;
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    slice              = ArrayProto.slice,
    hasOwnProperty     = ObjProto.hasOwnProperty;

  var looksLikeArray = function (obj) {
    return (obj.length === +obj.length
            && (_.isArguments(obj) || obj.constructor !== Object));
  };

  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (looksLikeArray(obj)) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = Object.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };
})();

module.exports = _;
