
var isNodeJS = (typeof module !== typeof (void 0) && module.exports)

if (isNodeJS)
  module.exports = T11;


const NUM_NIBS =  4;
const NUM_BITS =  2;
const MSK_NIBL =  3;

const MSK_STAT =  3;


function T11 () {
  this._size = 0;
  this._root = new T11_level();
}


T11.prototype.size = function () {
  return this._size;
}


T11_level = function () {
  this.marked = false;
  this.states = 0;
  this.oddord = 0;
  this.evnord = 0;
  this.levels = [];
}


T11.prototype.insert = function (s) {

  var chr;
  var ord;
  var nib;
  var nib2;

  var i;
  var N;
  var L;

  var t = this._root;

  // walk the tree
  for (i = 0, L = s.length; i < L; ++i) {
    chr = s.charCodeAt(i);

    for (N = 0; N < NUM_NIBS; ++N, chr >>>= NUM_BITS) {
      nib = chr & MSK_NIBL;
      nib2 = (nib << 1);
      stt = (t.states >>> nib2) & MSK_STAT;
      switch (stt) {
      // empty
      case 0 :
        t.states |= (1 << nib2); // set state from 0 to 1
        ord = t.levels.length;
        if (nib & 1)
          t.oddord |= (ord << ((nib & (~1)) << 1));
        else
          t.evnord |= (ord << ( nib         << 1));
        t.levels.push(t = new T11_level());
        break;
      // present
      case 1:
        ord = (nib & 1) ? t.oddord : t.evnord;
        nib = (nib & (~1)) << 1;
        t = t.levels[(ord >>> nib) & MSK_NIBL];
        break;
      //removed
      case 2:
        t.states ^= (3 << nib2); // flip state from 2 to 1
        ord = (nib & 1) ? t.oddord : t.evnord;
        nib = (nib & (~1)) << 1;
        t = (t.levels[(ord >>> nib) & MSK_NIBL] = new T11_level());
        break;
      case 3:
        throw 'Illegal state'; // remove after debug
      }
    }
  }

  // mark end, increase size
  if (i === L  &&  !(t.marked)) {
    ++this._size;
    t.marked = true;
  }
  
  // enable chaining
  return this;
}


T11.prototype.contains = function (s) {

  var chr;
  var nib;
  var ord;

  var i;
  var N;
  var L;

  var t = this._root;

  for (i = 0, L = s.length; i < L; ++i) {
    chr = s.charCodeAt(i);
    for (N = 0; N < NUM_NIBS; ++N, chr >>>= NUM_BITS) {
      nib = chr & MSK_NIBL;
      if (t.states & (1 << (nib << 1))) {
        ord = (nib & 1) ? t.oddord : t.evnord;
        nib = (nib & (~1)) << 1;
        t = t.levels[(ord >>> nib) & MSK_NIBL];
      }
      else return false;
    }
  }

  return (i === L  &&  t.marked);

}

T11.prototype.remove = function (s) {

  var chr;
  var nib;
  var ord;

  var i;
  var N;
  var L;

  var t = this._root;

  var anc_t = t; // save recent ancestor with >1 children
  var anc_n = 0;

  for (i = 0, L = s.length; i < L; ++i) {
    chr = s.charCodeAt(i);
    for (N = 0; N < NUM_NIBS; ++N, chr >>>= NUM_BITS) {
      nib = chr & MSK_NIBL;
      stt = (t.states >>> (nib << 1)) & MSK_STAT;
      switch (stt) {
      // empty
      case 0 :
        return this;
      // present
      case 1 :
        // gives 0 if state has 1 child (pow of 2)
        if ((t.states & (t.states - 1)) || t.marked) {
          anc_t = t;
          anc_n = nib;
        }
        ord = (nib & 1) ? t.oddord : t.evnord;
        nib = (nib & (~1)) << 1;
        t = t.levels[(ord >>> nib) & MSK_NIBL];
        break;
      // removed
      case 2 :
        return this;
      case 3:
        throw 'Illegal state';
      }
    }
  }

  // prune recent common ancestor
  if (i === L  &&  t.marked) {
    if (t.states) { // not empty!, t = recent common ancestor
      t.marked = false;
      --this._size;
      return this;
    }
    if (this._size === 1) {
      this._size = 0;
      this._root = new T11_level();
      return this;
    }
    // else
    t   = anc_t;
    nib = anc_n;
    t.states ^= 3 << (nib << 1); // flip state from 1 to 2
    ord = (nib & 1) ? t.oddord : t.evnord;
    nib = (nib & (~1)) << 1;
    delete t.levels[(ord >>> nib) & MSK_NIBL];

    --this._size;
  }

  return this;

}







// Constructors
T11.empty = function () {
  return new T11 ();
}


T11.singleton = function (s) {
  return (T11.empty()).insert(s);
}


