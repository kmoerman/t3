

var cc = Module;// require('./t3-cc.js');

var tri_create = cc.cwrap('tri_create', 'number', []);
var tri_insert = cc.cwrap('tri_insert', 'number', ['number', 'number', 'string']);
var tri_contains = cc.cwrap('tri_contains','number', ['number', 'number', 'string']);


function T6 () {
  this.tree = tri_create();
}

T6.prototype.insert = function (s) {
  tri_insert(this.tree, s.length, s);
  return this;
}

T6.prototype.contains = function (s) {
  return !!(tri_contains(this.tree, s.length, s));
}

// Constructors
T6.empty = function () {
  return new T6 ();
}


T6.singleton = function (s) {
  return (T6.empty()).insert(s);
}




//module.exports = T6;
