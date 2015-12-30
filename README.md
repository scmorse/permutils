# permutils
Utility package for permutations, including Lehmer codes.

### Example

```
var permutils = require('permutils');

/* .swap and .shuffle are useful permutation utilities */
var array = ["a", "b", "c"];
permutils.swap(array, 0, 1);   // array is now ["b", "a", "c"]
permutils.shuffle(array);      // Fisher–Yates shuffle, array is randomly ordered

/* Use .factoriadic and .unfactoriadic to encode/decode permutations as/from integers */
array = [2, 1, 0];
permutils.factoriadic(array);  // -> 5
permutils.unfactoriadic(5, 3); // -> [2, 1, 0]

/* Apply permutations */
array = ["a", "b", "c"];
permutils.permute(array, [0, 1, 2]); // array is untouched
permutils.permute(array, [2, 1, 0]); // array is reversed
```