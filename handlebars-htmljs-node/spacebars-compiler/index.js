// This is a hacked together node package of the spacebars-compiler sources
// found in
// https://github.com/meteor/meteor/tree/shark/packages/spacebars-compiler
// as a meteor package.

// I'm basically just going to concatenate the sources together, hand it
// over to eval, and then return the result in modules.export.
var HTML = require('../html-tools');
var Spacebars = require('../spacebars');
var UI = require('../ui');
var _ = require('../miniu');

// XXX HACK
var Package = {
  // not defining a minifier.
};

var fs = require('fs');
var source = ['tokens', 'tojs', 'templatetag', 'spacebars-compiler'].map(function(f) {
    return fs.readFileSync(__dirname+'/'+f+'.js', 'utf8');
}).join('\n');

eval(source);

module.exports = Spacebars;
