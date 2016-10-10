
module.exports = T5;

const N_NIBS =  2;
const N_BITS =  4;
const N_MASK = 15;
const N_LAST = (1 << 16);


function T5 () {
  this.size = 0;
  this.tree = new T5.level();
}


T5.level = function () {
  this.presence = 0;
  this.oddOrder = 0;
  this.evnOrder = 0;
  this.levels   = [];
}


T5.prototype.insert = function (s) {

  var L = s.length;
  var i = 0;
  var N = 2;

  var k = this.tree;
  var k_;

  var chr = s.charCodeAt(0);
  var ord = 0;
  var nib;

  // walk the tree
  // var t = Array.prototype.reduce.call(s, function (k, c) {
  // reduce makes it go slower (speedup factor of 2/3),
  // tested on nodejs
  while (i < L) {
    while (N) {
      nib = chr & 15;
      // present, go down a level
      if (k.presence & (1 << nib)) {
        ord = (nib & 1) ? k.oddOrder : k.evnOrder;
        nib = (nib & (~1)) << 1;
        k = k.levels[(ord >>> nib) & 15];
      }
      // not present, create the level
      else {
        k.presence |= (1 << nib);
        ord = k.levels.length;
        if (nib & 1)
          k.oddOrder |= (ord << ((nib & (~1)) << 1));
        else
          k.evnOrder |= (ord << ( nib         << 1));
        k_ = new T5.level();
        k.levels.push(k_);
        k = k_;
      }

      --N;
      chr >>>= 4;
    }

    ++i;
    chr = s.charCodeAt(i);
    N = 2;

  }

  // mark end, increase size
  if (!(k.presence & 65536)) {
    ++this.size;
    k.presence |= 65536;
  }
  
  // enable chaining
  return this;
}

/** 
 * @param {string} s
 */ 
T5.prototype.contains = function (s) {
  var L = s.length;
  var i = 0;
  var N = 0;

  var chr = s.charCodeAt(i);
  var nib = 0;
  var ord = 0;

  var t = this.tree;

  while (i < L) {
    nib = chr & 15;
    // present, go down a level
    if (t.presence & (1 << nib)) {
      ord = (nib & 1) ? t.oddOrder : t.evnOrder;
      nib = (nib & (~1)) << 1;
      t = t.levels[(ord >>> nib) & 15];
    }
    // not present, fail lookup
    else
      return false;

    switch (N) {
      case 0 : // after first nibble
        ++N;
        chr >>>= 4;
        break;
      case 1 : // after second nibble
        N = 0;
        ++i;
        chr = s.charCodeAt(i);
        break;
    }

  }

  return !!(t.presence & 65536);

}



// Constructors
T5.empty = function () {
  return new T5 ();
}


T5.singleton = function (s) {
  return (T5.empty()).insert(s);
}

