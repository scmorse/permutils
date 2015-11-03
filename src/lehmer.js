"use strict";

var _ = require('lodash');
var bigInt = require("big-integer");

/*

Number notation systems must be able to represent all integers.

In base 2,
  2^n - (1*2^(n-1) + 1*2^(n-2) + 1*2^(n-3) + ... + 1*2^0) = 1
In base 3,
  3^n - (2*3^(n-1) + 2*3^(n-2) + 2*3^(n-3) + ... + 2*3^0) = 1
In base 10,
  10^n - (9*10^(n-1) + 9*10^(n-2) + 9*10^(n-3) + ... + 9*10^0) = 1
  \  /   \                                                   /
   --     ---------------------------------------------------
   A                               B


Ex.
  1000 - (9*100 + 9*10 + 9*1)
  1000 - 999
  1

The important thing here is that the highest possible number using N-1 digits
without using the Nth digit (B) is only 1 less than the lowest possible number using
the Nth digit (A).

But there is another way to do this using a non-standard base representation.
 */