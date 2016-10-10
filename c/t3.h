
#ifndef t3_h
#define t3_h

#include <stddef.h>
#include <stdbool.h>

typedef  size_t         siz_t;
typedef  const char *   str_p;
typedef  struct tri_t * tri_p;

void  tri_insert   (tri_p, siz_t, str_p);
bool  tri_contains (tri_p, siz_t, str_p);
tri_p tri_create   ();

#endif // t3_h
