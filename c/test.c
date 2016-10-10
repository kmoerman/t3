
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include "t3.h"
#include "lorem.h"

int main (int argc, char** argv) {

  siz_t n = N * 0.8;
  
  tri_p t = tri_create();
  
  for (siz_t i = 0; i < n; ++i)
    tri_insert(t, strlen(s[i]), s[i]);
  
  for (siz_t i = 0; i < N; ++i)
    printf("%i %s\n",
           tri_contains(t, strlen(s[i]), s[i]),
           s[i]);
  
  free(t);
  
  return 0;
}

