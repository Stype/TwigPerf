// This is a hacked together node package of the html-tools sources found
// in https://github.com/meteor/meteor/tree/shark/packages/html-tools
// as a meteor package.

// I'm basically just going to concatenate the sources together, hand it
// over to eval, and then return the result in modules.export.
var HTML = require('../htmljs');
var fs = require('fs');
var _ = require('../miniu'); // uses _.map and _.extend

var source = ['scanner', 'charref', 'tokenize', 'parse', 'exports'].map(function(f) {
    return fs.readFileSync(__dirname+'/'+f+'.js', 'utf8');
}).join('\n');

eval(source);

module.exports = HTML;
