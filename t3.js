
function chain (child, parent) {
  child.prototype = Object.create(parent.prototype);
  child.prototype.constructor = child;
}


// Ternary search trees, for string/array based
// indexing; replacing the lookup capabilities
// of standard hashtables, the search tree allows
// for lookup on partial keys, which is not
// possible with native hashtables.
// 
// Additionally, we aim to outperform the native
// hash objects for usual operations: lookup (o[p]),
// insertion (o[p] = x), removal (delete o[p]),
// listing (Object.keys(o)), and traversal
// (for (p in o) f(p, o)).
// 
// This is a prototype library, probing performance;
// it should be reimplemented in C and ported back
// by emscripten; the code has been written with
// a distinct C flavor to ease the transition. 


// Type of ternary trees
function T3 () {
  this.tree = null;
  this.size = 0;
}

// Internal nodes
T3.Node = function (k) {
  this.tree = null;
  this.key  = k;
  this.alt  = [null, null];
}


T3.Epsilon = function () {
  this.tree = null;
}


chain (T3, Object);
chain (T3.Node   , T3);
chain (T3.Epsilon, T3);


// Element comparison
T3.compare = function (a, b) {
  return  a < b ?  0 : // LT
          a > b ?  1 : // GT
                   2 ; // EQ
}


// Constructors
T3.empty = function () {
  return new T3 ();
};

T3.singleton = function (word) {
  return (new T3 ()).insertFirst(word);
}

T3.fromArray = function (a) {
  for (var i = 0, n = a.length, t = T3.empty();
       i < n; ++i)
    t.insert(a[i]);
  return t;
}

T3.from = function () {
  return T3.fromArray(arguments);
}


// Operations
T3.prototype.insertFirst = function (word) {
  var s = Array.prototype.reduce.call(word,
    function (t, a) {
      var c = a.charCodeAt(0);
      t.tree = new T3.Node (c);
      return t.tree;
    }, this);

  s.tree = new T3.Epsilon ();
  this.size = 1;
  return this;
}

T3.Node.prototype.epsilon    = false;
T3.Epsilon.prototype.epsilon = true;


T3.prototype.contains = function (word) {

  if (this.size === 0) return false;

  var t = this;

  return Array.prototype.every.call(word, function (a) {
    var c = a.charCodeAt(0);
    t = t.tree;
    if (t !== null && t.epsilon) t = t.tree;

    while (t !== null && c !== t.key)
      t = t.alt[T3.compare(c, t.key)];

    return t !== null;
  }) && t.tree.epsilon;

}


T3.prototype.insert = function (word) {

  if (this.size === 0)
    return this.insertFirst(word);

  var N = 1; // potential size increment of set

  // store the string in the tree
  var s = Array.prototype.reduce.call(word, function (p, a) {
    var c = a.charCodeAt(0);
    var t = p.tree;
    var o;

    if (t && t.epsilon) {
      p = t;
      t = t.tree;
    }

    if (t === null)
      return (p.tree = new T3.Node (c));

    while (t !== null && c !== t.key) {
      o = T3.compare(c, t.key);
      p = t;
      t = t.alt[o];
    }

    if (t === null)
      return (p.alt[o] = new T3.Node (c));
  
    else return t;

  }, this);


  // add epsilon to the end
  if (s.tree === null)
    s.tree = new T3.Epsilon ();
  else {
    if (s.tree.epsilon)
      N = 0; // word already present
    else {
      t = new T3.Epsilon ();
      t.tree = s.tree;
      s.tree = t;
    }
  }

  this.size += N;
  return this;

}



// Lexicographically sorted array of keys
T3.prototype.toArray = function () {
  if (this.size === 0) return [];
  else {
    var s = { e: 0, i : 0, A: new Array (this.size), d: 0 };
    this.tree.toArrayStk(s); // this.toArrayDSW();

    return s.A.map(function (s) {
    return s.map(function (c) {
    return String.fromCharCode(c); })
            .join(''); });
  }
}


// Stack based traversal,
// prototype for DSW below
T3.prototype.toArrayStk = function (s) {

  if (this.epsilon) {
    s.A[s.e] = new Array (s.d);
    s.e++;
    if (this.tree === null)
      return;
    else
      return this.tree.toArrayStk(s);
  }

  if (this.alt[0] !== null) //left-first
    this.alt[0].toArrayStk(s);

  s.d++;
  var w = s.e; // replace with stackless info
  this.tree.toArrayStk(s);
  s.d--;
  while (w < s.e) {
    s.A[w][s.d] = this.key;
    w++;
  }

  if (this.alt[1] !== null)
    this.alt[1].toArrayStk(s);
}


/*

// Deutsch-Schorr-Waite traversal
T3.prototype.toArrayDSW = function () {
  var N = this.size;
  var A = new Array (N);

  var s = [0]; // stack (maintains visited state bits)
  var sp = 0; // stack pointer

  var p; // parent node
  var q; // temporary switch variable
  var t; // current tree

  var l; // string length (discovered at each epsilon)

  var i = 0; // range delimiters : left  inclusive
  var j = 1; //                  : right exclusive


  while (notFinished()) {

    switch (state()) {
    //NODES
      // node first visit
      case 0 : goDownLeft();

      // node second visit
      case 1 :

      // node third visit
      case 2 : console.log(String.fromCharCode(t.key));

      // node fourth visit
      case 3 :


    // EPSILONS
      // epsilon first visit
      case 4 : if (t.tree === null) goUpFromEpsilon();
               else { goDownFromEpsilon();
                      visit01(); }
               break;

      // epsilon second visit
      case 5 : goUpFromEpsilon();
               visit10();
               break;

    }

  }


  // states
  function state () {
    return (t.epsilon | 0) << 2
         | ((s[sp >>> 4] >>> ((15 & sp) << 1)) & 3);
  }


  // actions
  function visit01 () {
    s[sp >>> 4] |=  1 << ((15 & sp) << 1); // set 01, from 00
  }

  function visit02() {
    s[sp >>> 4] |=  2 << ((15 & sp) << 1); // set 10, from 00
  }

  function visitX3 () {
    s[sp >>> 4] |=  1 << ((15 & sp) << 1); // set 11, from any
  }

  function visit30 () {
    s[sp >>> 4] ^=  3 << ((15 & sp) << 1); // set 00, from 11
  }

  function visit12 () {
    s[sp >>> 4] ^=  3 << ((15 & sp) << 1); // set 10, from 01
  }

  function visit10 () {
    s[sp >>> 4] ^=  1 << ((15 & sp) << 1); // set 00, from 10 
  }


  // transitions
  function goDownAlt (dir) {
    q = t.alt[0];
    t.alt[0] = p;
    p = t;
    t = q;
  }

  function goUpLeft () {
    q = p.alt[0];
    p.alt[0] = t;
    t = p;
    p = q;
  }

  function goDownRight () {
    q = t.alt[1];
    t.alt[1] = p;
    p = t;
    t = q;
  }

  function goUpRight () {
    q = p.alt[1];
    p.alt[1] = t;
    t = p;
    p = q;
  }

  function goDownMiddle () {
    q = t.tree;
    t.tree = p;
    p = t;
    t = q;
  }

  function goUpMiddle () {
    q = p.tree;
    p.tree = t;
    t = p;
    p = q;
  }

  function goDownFromEpsilon () {
    goDownMiddle(); // same .tree interface
  }

  function goUpFromEpsilon () {
    goUpMiddle();  // same .tree interface
  }


  // turn nested numerical array
  // into strings array
  return A.map(function (s) {
    return s.map(function (c) { return String.fromCharCode(c); })
            .join(''); });


}

*/



module.exports = T3;