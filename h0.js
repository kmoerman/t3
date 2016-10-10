
// baseline native hash object, same Tx interface
// no performance difference w.r.t. plain hash

var isNodeJS = (typeof module !== typeof (void 0) && module.exports)

if (isNodeJS)
  module.exports = H0;

function H0 () {
  this._ = {};
}


H0.prototype.insert = function (s) {
  this._[s] = true;
  return this;
}


H0.prototype.contains = function (s) {
  return (s in this._);
}


H0.prototype.remove = function (s) {
  delete this._[s];
  return this;
}

H0.prototype.size = function () {
  return this.keys().length;
}

H0.prototype.keys = function () {
  return Object.keys(this._);
}

H0.prototype.union = function (that) {
  var h = H0.empty();
  var u = h._;
  var k;
  for (k in this._) u[k] = true;
  for (k in that._) u[k] = true;
  return h;
}


// constructors
H0.empty = function () {
  return new H0 ();
}


H0.singleton = function (s) {
  return (H0.empty()).insert(s);
}