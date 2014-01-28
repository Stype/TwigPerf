// This is a hacked together node package of the HTMLJS sources found
// in https://github.com/meteor/meteor/tree/shark/packages/htmljs
// as a meteor package.

// I'm basically just going to concatenate the sources together, hand it
// over to eval, and then return the result in modules.export.
var fs = require('fs');

var source = ['utils', 'html', 'tohtml'].map(function(f) {
    return fs.readFileSync(__dirname+'/'+f+'.js', 'utf8');
}).join('\n');

eval(source);

module.exports = HTML;
