
module.exports = T7;


const N_NIBS =  2;
const N_BITS =  4;
const N_MASK = 15;
const N_MARK = (1 << 16);


function T7 () {
  this._size = 0;
  this._tree = new T7_level();
}


T7_level = function () {
  this.presence = 0;
  this.oddOrder = 0;
  this.evnOrder = 0;
  this.levels   = [];
}


T7.prototype.insert = function (s) {

  var chr;
  var ord;
  var nib;

  var t = this._tree;

  // walk the tree
  for (var i = 0, L = s.length; i < L; ++i) {
    chr = s.charCodeAt(i);
    for (var N = 0; N < N_NIBS; ++N, chr >>>= N_BITS) {
      nib = chr & N_MASK;
      // present, go down a level
      if (t.presence & (1 << nib)) {
        ord = (nib & 1) ? t.oddOrder : t.evnOrder;
        nib = (nib & (~1)) << 1;
        t = t.levels[(ord >>> nib) & N_MASK];
      }
      // not present, create the level
      else {
        t.presence |= (1 << nib);
        ord = t.levels.length;
        if (nib & 1)
          t.oddOrder |= (ord << ((nib & (~1)) << 1));
        else
          t.evnOrder |= (ord << ( nib         << 1));
        t.levels.push(t = new T7_level());
      }
    }
  }

  // mark end, increase size
  if (!(t.presence & N_MARK)) {
    ++this._size;
    t.presence |= N_MARK;
  }
  
  // enable chaining
  return this;
}


T7.prototype.contains = function (s) {

  var chr;
  var nib;
  var ord;

  var t = this._tree;

  // while -> for conversion = order of magnitude speedup
  for (var i = 0, L = s.length; i < L; ++i) {
    chr = s.charCodeAt(i);
    for (var N = 0; N < N_NIBS; ++N, chr >>>= N_BITS) {
      nib = chr & N_MASK;
      // present, go down a level
      if (t.presence & (1 << nib)) {
        ord = (nib & 1) ? t.oddOrder : t.evnOrder;
        nib = (nib & (~1)) << 1;
        t = t.levels[(ord >>> nib) & N_MASK];
      }
      // not present, fail lookup
      else
        return false;
    }
  }

  return !!(t.presence & N_MARK);

}


T7.prototype.size = function () {
  return this._size;
}


// Constructors
T7.empty = function () {
  return new T7 ();
}


T7.singleton = function (s) {
  return (T7.empty()).insert(s);
}

