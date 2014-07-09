// This is a hacked together node package of the spacebars sources found in
// https://github.com/meteor/meteor/tree/shark/packages/spacebars
// as a meteor package.

// I'm basically just going to concatenate the sources together, hand it
// over to eval, and then return the result in modules.export.
var HTML = require('../htmljs');
var UI = require('../ui');

// HACK HACK HACK
Deps = {
  isolateValue: function(f) { return f(); }
};
Handlebars = UI.Handlebars;

// ok, load spacebars-runtime.js
var fs = require('fs');
var source = ['spacebars-runtime'].map(function(f) {
    return fs.readFileSync(__dirname+'/'+f+'.js', 'utf8');
}).join('\n');

eval(source);

module.exports = Spacebars;
