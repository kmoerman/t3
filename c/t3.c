

typedef struct T3Node {
  struct T3Node* tree;
  int size;
} T3Node;


typedef struct {
  T3Node* tree;
  int size;
} T3;

struct T3Epsilon {
  T3Node* tree;
};



int main (int argc, char** argv) {
  return 0;
}