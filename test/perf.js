
var isNodeJS = (typeof module !== typeof (void 0) && module.exports)

if (isNodeJS)
  var Benchmark = require('benchmark');

//var lipsum = require('lorem-ipsum');
var words    = require('random-words');
var sprintf  = require('sprintf-js').sprintf;



var H0 = require('../h0.js');
//var T3 = require('../t3.js'); 
//var T4 = require('../t4.js'); // outperforms t3 by factor of 0.25
//var T5 = require('../t5.js');
//var T7 = require('../t7.js');   // outperforms t4,t5 by factor of 10; no remove method
var T8  = require('../t8.js');
//var T11 = require('../t11.js');


var Ts = [H0,T8/*,T11*/]//.map(function (m) { return require('../' + m); });


// https://bost.ocks.org/mike/shuffle/compare.html
// Fisher-Yates shuffle
function shuffle (array) {
  var m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
}



// INSERT
function insertT (arr, i, n, t) {
  for(;i < n; ++i)
    t.insert(arr[i]);
  return t;
}


// LOOKUP
function lookupT (arr, i, n, t) {
  var k = 0;
  for (; i < n; ++i)
    if (t.contains(arr[i])) ++k;
  return k;
}


// REMOVE
function removeT (arr, i, n, t) {
  var k = 0;
  for (; i < n; ++i)
    t.remove(arr[i]);
}


// setup the test input
//var A = lipsum({count: 10000, units: 'sentences', sentenceLowerBound: 1, sentenceUpperBound: 10}).split('. ');
//var A = lipsum({count: 10000, units: 'words'}).split(' ');
const N = 10000;
var A = words(N); // TODO add some duplication

// T7 a little slower than H0 or plain hash with words, but same order of magnitude
// T7 much slower than H0 for sentences, 2 orders of magnitude


const P = 0.8;
const M = Math.floor(N * P);

const Q = 0.8;
const O = Math.floor(N * Q);

const UA = Math.floor(N * 0.3);
const UB = Math.floor(N * 0.5);

var insert = new Benchmark.Suite ('INSERT (' + M + ')');
var lookup = new Benchmark.Suite ('LOOKUP (' + N + ')');
var remove = new Benchmark.Suite ('REMOVE (' + O + ')');
var keygen = new Benchmark.Suite ('KEYGEN (' + M + ')');
var union  = new Benchmark.Suite ('UNION  (' + UA + ', ' + UB +')');

var tests = [ insert
            , lookup
            , remove
            //, keygen
            //, union
            ];

var a = [], b = [], k = [], u =[];

tests.forEach(function (t) { t.on('cycle', function () { shuffle(A); }); });


Ts.forEach(function (t, i) {
  var f = name(t);

  insert.add(f + ' ', function () { a[i] = insertT(A, 0, M, t.empty()); });

  lookup.add(f + ' ', function () { lookupT(A, 0, N, a[i]);             });

  remove.add(f + ' ', function () { removeT(A, 0, O, a[i]);             }
          
            , {onCycle : function () {
                a[i] = insertT(A, 0, M, t.empty()); } } );

  //keygen.add(f + ' ', function () { k[i] = a[i].keys(); },
  //           {onCycle : function () { a[i] = insertT(A, 0, M, t.empty()); }});
  
  union.add(f + ' ', function () { u[i] = a[i].union(b[i]);  },
             {onStart : function () { a[i] = insertT(A, 0, UA, t.empty());
                                      shuffle(A);
                                      b[i] = insertT(A, 0, UB, t.empty());
                                      } /*,

              onCycle : function () { a[i] = insertT(A, 0, UA, t.empty());
                                      shuffle(A);
                                      b[i] = insertT(A, 0, UB, t.empty()); } */ }  ); 
});

function name (f) {
  return /function ([^\(]+)/.exec(f.prototype.constructor.toString())[1];
}

function complete () {
  console.log(this.name);
  this.each(function (b) { 
    var s = b.stats;
    console.log(sprintf(' %.3s : mean %0.5f , +/- %0.2f%%',
                        b.name, s.mean, s.rme));
  });
}


tests.forEach(function (t) { t.on('complete', complete)
                              .run(); });


