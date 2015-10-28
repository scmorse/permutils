"use strict";

var _ = require('lodash');
var lehmer = require('./lehmer');
var permutils = module.exports = {};

_.isInt = function(n) {
  return _.isNumber(n) && n % 1 === 0;
};

permutils.treeduce = function(arr, method) {
  if (!_.isFunction(method) || !_.isArray(arr) || arr.length === 0) {
    return;
  }
  var result = new Array(Math.floor((arr.length + 1) / 2));
  for (var i = 0; i < arr.length; i += 2) {
    result[i/2] = method(arr[i], (i + 1 < arr.length) ? arr[i+1] : undefined);
  }
  return result.length === 1 ? result[0] : permutils.treeduce(result, method);
};

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
  return Array.apply(null, {length: len}).map(Number.call, Number);
};

/**
 *
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
 *
 */
permutils.permutation = function(/* base, perm1, perm2, ... */) {
  if (arguments.length <= 1) {
    return arguments.length ? arguments[0] : [];
  }
  var base = arguments[0];
  if (!_.isArray(base)) {
    return base;
  }
  var perms = _.slice(arguments, 1);
  var hasSameLen = function(arr) {
    return !!arr && arr.length === base.length;
  };
  if (!_.every(perms, permutils.isValid) || !_.every(perms, hasSameLen)) {
    return base;
  }
  _.each(perms, function(perm) {
    var temp = permutils.identity(perm.length);
    _.each(perm, function(p, i) {
      temp[i] = base[p];
    });
    base = temp;
  });
  return base;
};
