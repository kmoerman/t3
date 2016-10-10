
var isNodeJS = (   typeof module !== 'undefined'
                && module.exports );

if (isNodeJS)
  module.exports = T9;


const SIZ_CHAR = 8; // actually 16 in UTF-16 js
const SIZ_NIBL = 4;

const NUM_NIBL = SIZ_CHAR / SIZ_NIBL;
const NUM_ALFA = 1 << SIZ_NIBL;
const MSK_NIBL = NUM_ALFA - 1;

const NIB_ALFA = NUM_ALFA + 0;
const NIB_OMGA = NUM_ALFA + 1;


function arr (n, f) {
  return typeof v == 'function' ?
    (new Array(n)).map(function (_, i) { return f(i); }) :
    (new Array(n)).map(function ()     { return f;    }) ;
}


function T9 () {
  this._siz = 0;

  var n = NUM_ALFA + 1;

  this._mtx = arr(n,
    (function () { return arr(n, 0); }));
}


T9.prototype.contains (s) {

  var i;
  var L;
  var N;

  var ioc;

  var chr;
  var nba;
  var nbb;

  var mtx = this._mtx;

  for (nba = NIB_ALFA, i = 0, L = s.length, ioc = 0;
       i < L; ++i) {
    chr = s.charCodeAt(i);
    for (N = 0; N < NUM_NIBL;
         ++N, chr >>>= SIZ_NIBL, nba = nbb) {
      nbb = chr & MSK_NIBL;
      

    }
  }


  // NIB_OMGA


}


T9.prototype.size = function () {
  return this._siz;
}

