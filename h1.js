
// baseline native hash object, same Tx interface
// no performance difference w.r.t. plain hash

module.exports = H1;

function H1 () {
  this._ = {};
}


H1.prototype.insert = function (s) {
  this._[s] = true;
  return this;
}


H1.prototype.contains = function (s) {
  return (s in this._);
}


// alternate remove method
// much slower, poor scaling
H1.prototype.remove = function (s) {
  this._[s] = false;
  return this;
}


H1.empty = function () {
  return new H1 ();
}


H1.singleton = function (s) {
  return (H1.empty()).insert(s);
}