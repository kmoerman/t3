
fn = "['_tri_insert','_tri_contains','_tri_create']"

t3-cc.js : c/t3.c
	emcc $< -o $@ -s EXPORTED_FUNCTIONS=$(fn) \
	              -s ALLOW_MEMORY_GROWTH=1    \
	              -O2

browser : t3-cc.js
	browserify test/perf.js -o bundle.js