"use strict";

var _ = require('lodash');
var permutils = module.exports = {};

/**
 * This is on a development branch of lodash, add it here for convenience.
 */
_.isInt = function(n) {
  return _.isNumber(n) && n % 1 === 0;
};

/**
 * Reduces the array in pairs up a tree.
 * Ex.
 * treeduce([1, 3, 5], function(a, b) { return b !== undefined ? a*a + b*b : a*a; })
 * ( [1, 3, 5] )
 * ( [10, 25] )
 * ( [725] )
 * > 725
 */
permutils.treeduce = function(arr, method) {
  if (!_.isFunction(method) || !_.isArray(arr) || arr.length === 0) {
    return;
  }
  var result = new Array(Math.ceil(arr.length / 2));
  for (var i = 0; i < arr.length; i += 2) {
    result[i/2] = method(arr[i], (i + 1 < arr.length) ? arr[i+1] : undefined);
  }
  return result.length === 1 ? result[0] : permutils.treeduce(result, method);
};

/**
 * Ex.
 * > var arr = ["a", "b", "c"]
 * > permutils.swap(arr, 0, 2)
 * > arr
 * [ "c", "b", "a" ]
 */
permutils.swap = function(arr, a, b) {
  if (!_.isArray(arr) || !_.isInt(a) || !_.isInt(b)) {
    return;
  }
  var temp = arr[b];
  arr[b] = arr[a];
  arr[a] = temp;
};

/**
 * Ex.
 * > permutils.identity(3)
 * [0, 1, 2]
 */
permutils.identity = function(len){
  len = _.isInt(len) ? Math.max(len, 0) : 0;
  var arr = new Array(len);
  for (var i = 0; i < len; i++) {
    arr[i] = i;
  }
  return arr;
};

/**
 * Random permutation array.
 *
 * Ex.
 * > permutils.random(4)
 * [ 2, 1, 3, 0 ]
 */
permutils.random = function(len) {
  len = _.isInt(len) ? Math.max(len, 0) : 0;
  var shuffled = permutils.shuffle(permutils.identity(len));
  return shuffled;
};

/**
 * Fisher–Yates shuffle.
 *
 * inPlace defaults to true, use false to override.
 */
permutils.shuffle = function(arr, inPlace) {
  if (!_.isArray(arr)) {
    return;
  }
  arr = (inPlace !== false) ? arr : _.clone(arr);
  var max = arr.length;
  var rand;
  // While there are elements left to shuffle
  while (max) {
    // Pick a remaining element
    rand = Math.floor(Math.random() * max--);
    // And swap it with the current element.
    permutils.swap(arr, max, rand);
  }
  return arr;
};

/**
 * Test if a permuation array encodes a valid permutation.
 *
 * Ex.
 * [2, 0, 1] -> true (valid)
 * Ex.
 * [1, 2, 3] -> false (invalid)
 */
permutils.isValid = function(arr) {
  if (!_.isArray(arr)) {
    return false;
  }
  var base = permutils.identity(arr.length);
  return _.every(arr, function(n) {
    var inRange = n >= 0 && n < arr.length;
    if (inRange) {
      base[n] = null;
    }
    return inRange;
  }) && _.every(base, _.isNull);
};

/**
 * Ex.
 * ["a", "b", "c"], [0, 2, 1] --> ["a", "c", "b"]
 */
permutils.permute = function(/* base, perm1, perm2, ... */) {
  if (arguments.length < 2) {
    return arguments.length ? arguments[0] : undefined;
  }
  var base = arguments[0];
  if (!_.isArray(base)) {
    return undefined;
  }
  var perms = _.slice(arguments, 1);
  var hasSameLen = function(arr) {
    return !!arr && arr.length === base.length;
  };
  if (!_.every(perms, hasSameLen) || !_.every(perms, permutils.isValid)) {
    return base;
  }

  _.each(perms, function(perm) {
    var start;
    while (true) {
      start = start === undefined ? 0 : start + 1;
      if (start >= perm.length) break;
      if (perm[start] < 0) continue;
      var curr = start, pval = perm[curr];

      while (true) {
        perm[curr] = (pval + 1) * -1;
        if (pval === start) break;
        permutils.swap(base, pval, curr);
        curr = pval;
        pval = perm[curr];
      }
    }

    // Revert the perm elements to leave it untouched
    _.each(perm, function(p, i) {
      perm[i] = (perm[i] * -1) - 1;
    });
  });
  return base;
};

/**
 * Ex.
 * permutils.nextWrapping(["a", "b", "c"], "a")
 * > "b"
 * permutils.nextWrapping(["a", "b", "c"], "b")
 * > "c"
 * permutils.nextWrapping(["a", "b", "c"], "c")
 * > "a"
 */
permutils.nextWrapping = function(arr, elem) {
  if (!_.isArray(arr) || arr.length === 0) {
    return undefined;
  }
  var i = arr.indexOf(elem);
  if (i < 0) {
    return undefined;
  }
  return arr[(i+1) % arr.length];
};

/*
 * 1 * 2 * ... * n
 *
 * Ex.
 * 0 -> 1
 * 1 -> 1
 * 2 -> 2
 * 3 -> 6
 * 3 -> 6
 */
permutils.factorial = function(n) {
  if (!_.isInt(n) || n < 0) {
    throw Error("Input out of range");
  }
  var result = 1;
  while (n > 0) {
    result *= n--;
  }
  return result;
};

/*
 * Encodes a permutation as an integer using Lehmer codes.
 *
 * Ex.
 * [0, 1, 2] -> 0
 * [0, 2, 1] -> 1
 * [1, 0, 2] -> 2
 * [1, 2, 0] -> 3
 * [2, 0, 1] -> 4
 * [2, 1, 0] -> 5
 */
permutils.factoriadic = function(arr) {
  if (!permutils.isValid(arr)) {
    return -1;
  }
  if (arr.length > 18) {
    throw new Error('Cannot use arrays of length ' + arr.length + ', or any integer more than 18. Javascript integers only allow for up to 18! (18 factorial)');
  }
  arr = arr.map(_.identity);
  var placeValue = permutils.factorial(arr.length);
  var result = 0;
  var val;
  for (var i = 0; i < arr.length; i++) {
    placeValue = placeValue / (arr.length - i);
    val = arr[i];
    for (var j = i + 1; j < arr.length; j++) {
      if (arr[j] > val) {
        arr[j]--;
      }
    }
    result += placeValue * val;
  }
  return result;
};

/*
 * Decodes an integer to a permutation array using Lehmer codes.
 *
 * 0, 3 -> [0, 1, 2]
 * 1, 3 -> [0, 2, 1]
 * 2, 3 -> [1, 0, 2]
 * 3, 3 -> [1, 2, 0]
 * 4, 3 -> [2, 0, 1]
 * 5, 3 -> [2, 1, 0]
 *
 *   0, 5 -> [0, 1, 2, 3, 4]
 *   1, 5 -> [0, 1, 2, 4, 3]
 * ...
 * 119, 5 -> [4, 3, 2, 1, 0]
 */
permutils.unfactoriadic = function(val, arrLen) {
  if (!_.isInt(val) || !_.isInt(arrLen)) {
    throw new Error('Must provide the encoded permutation integer and the length of permutation expected back.');
  }
  if (arrLen > 18) {
    throw new Error('Cannot use arrays of length ' + arrLen + ', or any integer more than 18. Javascript integers only allow for up to 18! (18 factorial)');
  }
  if (val < 0 || arrLen < 0) {
    return null;
  }

  var n = val;
  var arr = new Array(arrLen);
  _.times(arrLen, function(i) {
    arr[arrLen - i - 1] = n % (i + 1);
    n = Math.floor(n/(i+1));
  });

  for (var i = arrLen - 1; i >= 0; i--) {
    for (var j = i+1; j < arrLen; j++) {
      if (arr[j] >= arr[i]) {
        arr[j]++;
      }
    }
  }

  return arr;
};

/*
 * Calculates the inversion permutation. When both a permutation and its inverse has
 * been applied to a base array, the array will be unchanged.
 */
permutils.inverse = function(arr) {
  if (!_.isArray(arr) || !permutils.isValid(arr)) {
    return null;
  }

  var res = new Array(arr.length);
  for (var i = 0; i < arr.length; i++) {
    res[arr[i]] = i;
  }

  return res;
};

