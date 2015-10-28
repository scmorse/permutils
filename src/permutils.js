"use strict";

var _ = require('lodash');
var lehmer = require('./lehmer');

var permutils = module.exports = {};

/**
 * Ex.
 * > permutils.identity(3)
 * [0, 1, 2]
 */
permutils.identity = function(len){
  len = _.isNumber(len) ? Math.max(len, 0) : 0;
  return Array.apply(null, {length: len}).map(Number.call, Number);
};

/**
 *
 */
permutils.random = function(len) {
  len = _.isNumber(len) ? Math.max(len, 0) : 0;
  var shuffled = permutils.shuffle(permutils.identity(len));
  return shuffled;
};

/**
 * Fisher–Yates shuffle.
 */
permutils.shuffle = function(arr, inPlace) {
  if (!_.isArray(arr)) {
    return;
  }
  arr = (inPlace !== false) ? arr : _.clone(arr);
  var max = arr.length;
  var rand, temp;
  // While there are elements left to shuffle
  while (max) {
    // Pick a remaining element
    rand = Math.floor(Math.random() * max--);
    // And swap it with the current element.
    temp = arr[max];
    arr[max] = arr[rand];
    arr[rand] = temp;
  }
  return arr;
};

/**
 *
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
