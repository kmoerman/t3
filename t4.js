
const N_BITS =  4;
const N_MASK = 15;
const N_LAST = (1 << 16);

function T4 () {
  this.size = 0;
  this.tree = new T4.level();
}

T4.level = function () {
  this.presence = 0;
  this.oddOrder = 0;
  this.evnOrder = 0;
  this.levels   = [];
}


T4.prototype.insert = function (s) {
  var L = s.length;
  var i = 0;
  var N = 0;

  var chr = s.charCodeAt(i);
  var nib = 0;
  var ord = 0;

  var t = this.tree;
  var t_;

  // walk the tree
  while (i < L) {
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
      t_ = new T4.level();
      t.levels.push(t_);
      t = t_;
    }

    switch (N) {
      case 0 : // after first nibble
        ++N;
        chr >>>= N_BITS;
        continue;
      case 1 : // after second nibble
        N = 0;
        ++i;
        chr = s.charCodeAt(i);
        continue;
    }
  }

  // mark end, increase size
  if (!(t.presence & N_LAST)) {
    ++this.size;
    t.presence |= N_LAST;
  }
  
  // enable chain
  return this;
}


T4.prototype.contains = function (s) {
  var L = s.length;
  var i = 0;
  var N = 0;

  var chr = s.charCodeAt(i);
  var nib = 0;
  var ord = 0;

  var t = this.tree;

  while (i < L) {
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

    switch (N) {
      case 0 : // after first nibble
        ++N;
        chr >>>= N_BITS;
        continue;
      case 1 : // after second nibble
        N = 0;
        ++i;
        chr = s.charCodeAt(i);
        continue;
    }

  }

  return !!(t.presence & N_LAST);

}


// Constructors
T4.empty = function () {
  return new T4 ();
}


T4.singleton = function (s) {
  return (T4.empty()).insert(s);
}


module.exports = T4;
