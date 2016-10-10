
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>
#include <limits.h>

#include "t3.h"


typedef  size_t         siz_t;
typedef  char           chr_t;
typedef  const chr_t *  str_p;
typedef  struct nod_t * nod_p;
typedef  nod_p *        stk_p;
typedef  struct tri_t * tri_p;


typedef struct nod_t { uint32_t hdr;
                       stk_p    stk;
                       uint64_t ord;
                     } nod_t;


typedef struct tri_t { siz_t siz;
                       nod_p nod;
                     } tri_t;

/*
 *  nod.hdr layout, 32bit value
 *         24      16       8       0
 *  +--------========--------========+
 *  |          SSSSSpMMMMMMMMMMMMMMMM|
 *  +--------========--------========+
 *   S :  5 bit, number of children on stack (0 - 16)
 *   p :  1 bit, mark end of string
 *   M : 16 bit, mark presence of each child
 *
 *   10 bits unused
 */

static const siz_t     siz_char = CHAR_BIT;
static const siz_t     siz_nibl =        4;
static const siz_t     siz_incr =       16;

static const siz_t     num_nibs = siz_char / siz_nibl;              //     2
static const siz_t     num_nods = 1 << siz_nibl;                    //    16
static const uint32_t  msk_mark = 1 << num_nods;                    // 65536
static const chr_t     msk_nibl = num_nods - 1;                     //    15
static const uint32_t  msk_size = msk_nibl | (1 << siz_nibl);       //    31
static const siz_t     sft_size = num_nods + 1;                     //    17
static const uint32_t  msk_grow = (siz_incr - 1) | (1 << siz_nibl); //    19


// constructors
nod_p nod_create ( )
  { nod_p nod;
    nod = malloc(sizeof(nod_t));
    nod->hdr = 0;
    nod->ord = 0;
    nod->stk = malloc(siz_incr * sizeof(nod_p));
    return nod; }

tri_p tri_create ( )
  { tri_p tri;
    tri = malloc(sizeof(tri_t));
    tri->siz = 0;
    tri->nod = nod_create();
    return tri; }

stk_p stk_increase (stk_p stk, siz_t siz)
  { return realloc (stk, siz); }

// operations
void tri_insert ( tri_p tri
                , siz_t len
                , str_p str )
  { siz_t pos,
          siz,
          nbc,
          nib;
    chr_t chr;
    nod_p nod = tri->nod,
          tmp;
    
    for (pos = 0, chr = str[pos]; pos < len; ++pos, chr=str[pos])
    for (nbc = 0; nbc < num_nibs; ++nbc, chr >>= siz_nibl)
      { nib = chr & msk_nibl;
        // present, go down one level
        if (nod->hdr & (1 << nib))
          { nib *= siz_nibl;
            siz = ((uint32_t)(nod->ord >> nib)) & msk_nibl;
            nod = nod->stk[siz]; }
        // not present, create level
        else
          { siz = ((nod->hdr >> sft_size) & msk_size);
            nod->ord |= (((uint64_t)siz) << (nib * siz_nibl));
            tmp = nod_create();
            nod->stk[siz] = tmp;
            ++siz;
            if ((siz & msk_grow) == 0)
              nod->stk = stk_increase(nod->stk, siz + siz_incr);
            nod->hdr ^= ((siz ^ (siz-1)) << sft_size) | (1 << nib);
            nod = tmp; } }
    
    if (!(nod->hdr & msk_mark))
      { ++tri->siz;
        nod->hdr |= msk_mark; } }


bool tri_contains ( tri_p tri
                  , siz_t len
                  , str_p str )
  { siz_t pos,
          nbc,
          nib;
    chr_t chr;
    nod_p nod = tri->nod;
    
    for (pos = 0, chr = str[pos]; pos < len; ++pos, chr=str[pos])
    for (nbc = 0; nbc < num_nibs; ++nbc, chr >>= siz_nibl)
      { nib = chr & msk_nibl;
        // present, go own one level
        if (nod->hdr & (1 << nib))
          { nib *= siz_nibl;
            nod = nod->stk[((siz_t)(nod->ord >> nib) & msk_nibl)]; }
        // not present, fail lookup
        else return false; }
    
    return !!(nod->hdr & msk_mark); }
