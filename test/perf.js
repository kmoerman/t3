
var T3 = require('../t3.js');

var Benchmark = require('benchmark');
var lipsum    = require('lorem-ipsum');
var sprintf   = require('sprintf-js').sprintf;


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
function insertH (arr, i, n) {
  var h = {};
  for (; i < n; ++i)
    h[arr[i]] = true;
  return h;
}


function insertT (arr, i, n) {
  var t = T3.empty();
  for(;i < n; ++i)
    t.insert(arr[i]);
  return t;
}


// LOOKUP
function lookupH (arr, i, n, h) {
  var k = 0;
  for (; i < n; ++i)
    if (arr[i] in h) ++k;
  return k;
}

function lookupT (arr, i, n, t) {
  var k = 0;
  for (; i < n; ++i)
    if (t.contains(arr[i])) ++k;
  return k;
}


// KEYGEN
function keygenH (h) {
  return Object.keys(h);
}

function keygenT (t) {
  return t.toArray();
}



// setup the test input
var A = lipsum({count: 2000, units: 'words'}).split(' ');
var n = A.length;
var p = 0.8;
var m = Math.floor(n * p);


// setup the tests
var insert = new Benchmark.Suite ('INSERT (' + m + ')');
var lookup = new Benchmark.Suite ('LOOKUP (' + n + ')');
var genkey = new Benchmark.Suite ('GENKEY (' + m + ')');

var h, t;

insert
  .add('hash', function () { h = insertH(A, 0, m); })
  .add('tern', function () { t = insertT(A, 0, m); });

lookup
  .on('start', function () { shuffle(A); });

lookup
  .add('hash', function () { lookupH(A, 0, n, h); })
  .add('tern', function () { lookupT(A, 0, n, t); });

genkey
  .add('hash', function () { var k = keygenH(h); })
  .add('test', function () { var k = keygenT(t); });


function complete () {
  console.log(this.name);
  this.each(function (b) { 
    var s = b.stats;
    console.log(sprintf(' %s : mean %0.10f , σ %0.11f', b.name, s.mean, s.deviation));
  });
}


[insert,lookup,genkey]
  .forEach(function (s) { s.on('complete', complete).run(); });

