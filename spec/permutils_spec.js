"use strict";

var _ = require('lodash');
var chai = require('chai');
var expect = chai.expect;

var permutils = require('../src/permutils');

// Currying helper functions

var eqs = function(arr1) {
  return function(arr2) {
    return _.isEqual(arr1, arr2);
  };
};

var neq = function(arr1) {
  return function(arr2) {
    return !_.isEqual(arr1, arr2);
  };
};

var one = function(arrs) {
  return function(arr2) {
    return _.any(arrs, eqs(arr2));
  };
};

var calling = function(func) {
  return {
    withArgs: function(/* arg1, arg2, ... */) {
      var args = _.map(arguments);
      return function() {
        func.apply(null, args);
      };
    },
    withoutArgs: function() {
      return func;
    }
  };
};

// Valid permutations
var valid = [
  [],
  [0],
  [0, 1],
  [1, 0],
  [0, 1, 2],
  [0, 1, 2, 3],
  [3, 2, 0, 1],
  [1, 2, 0, 3],
  [8, 4, 1, 7, 9, 0, 2, 5, 3, 6],
  [0, 14, 9, 3, 10, 23, 11, 24, 7, 8, 5, 21, 13, 15, 12, 16, 4, 1, 2, 17, 20, 19, 18, 22, 6]
];

// Invalid permutations
var invalid = [
  null,
  [1],
  [0, 0],
  [1, 1],
  [0, 1, 2, 4],
  [8, 4, 1, 7, 9, 0, 2, 5, 3, 3],
  [0, 14, 9, 3, 10, 23, 11, 24, -1, 8, 5, 21, 13, 15, 12, 16, 4, 1, 2, 17, 20, 19, 18, 22, 6]
];

var outOfFactoriadicRange = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

var allPermsLength3 = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0]
];

var allPermsLength3Invs = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [2, 0, 1],
  [1, 2, 0],
  [2, 1, 0]
];

describe('Test permutils', function() {

  it('treeduce calculations', function() {
    var format = function(a, b) {
      return "(" + (b ? a + "-" + b : a) + ")";
    };
    expect(permutils.treeduce([], format)).to.equal(undefined);
    expect(permutils.treeduce([1], format)).to.equal("(1)");
    expect(permutils.treeduce([1, 2], format)).to.equal("(1-2)");
    expect(permutils.treeduce([1, 2, 3], format)).to.equal("((1-2)-(3))");
    expect(permutils.treeduce([1, 2, 3, 10], format)).to.equal("((1-2)-(3-10))");
    expect(permutils.treeduce([1, 2, 3, 10, 1000], format)).to.equal("(((1-2)-(3-10))-((1000)))");
  });

  it('swap swaps', function() {
    var arr = ["a", "b"];
    permutils.swap(arr, 0, 1);
    expect(arr).to.equal(arr);
    expect(arr).to.satisfy(eqs(["b", "a"]));

    permutils.swap(arr, 1, 1);
    expect(arr).to.satisfy(eqs(["b", "a"]));

    permutils.swap(arr, 1);
    expect(arr).to.satisfy(eqs(["b", "a"]));
  });

  it('Produces proper identity', function() {
    expect(permutils.identity(undefined)).to.satisfy(eqs([]));
    expect(permutils.identity(null)).to.satisfy(eqs([]));
    expect(permutils.identity(-1)).to.satisfy(eqs([]));
    expect(permutils.identity(0)).to.satisfy(eqs([]));
    expect(permutils.identity(1)).to.satisfy(eqs([0]));
    expect(permutils.identity(2)).to.satisfy(eqs([0, 1]));
    expect(permutils.identity(3)).to.satisfy(eqs([0, 1, 2]));
    expect(permutils.identity(10)).to.satisfy(eqs([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  });

  it('Produces random permutation', function() {
    var hit = {};
    _.times(75, function(){
      var ind = _.findIndex(allPermsLength3, eqs(permutils.random(3)));
      expect(ind).to.be.at.least(0);
      hit["" + ind] = 1;
    });

    _.each([0, 1, 2, 3, 4, 5], function(x) {
      expect(hit["" + x]).to.eq(1);
    });
  });

  it('shuffle array', function() {
    var arr = [0, 1, 2];
    expect(permutils.shuffle(arr)).to.equal(arr);
    expect(permutils.shuffle(arr, false)).to.not.equal(arr);
    expect(permutils.shuffle(null)).to.equal(undefined);
  });

  it('isValid on valid permutations', function() {
    _.each(valid, function(p){
      expect(permutils.isValid(p)).to.equal(true);
    });
  });

  it('isValid on invalid permutations', function() {
    _.each(invalid, function(p){
      expect(permutils.isValid(p)).to.equal(false);
    });
  });

  it('permute', function() {
    var orig = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    var res  = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    var perm = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    _.times(perm.length-1, function() {
      permutils.permute(res, perm);
      expect(res).to.not.satisfy(eqs(orig));
    });
    permutils.permute(res, perm);
    expect(res).to.satisfy(eqs(orig));

    expect(permutils.permute(orig)).to.equal(orig);
    expect(permutils.permute("arg1", 1)).to.equal(undefined);
    expect(permutils.permute(orig, [0, 1, 2])).to.equal(orig);
  });

  it('nextWrapping', function() {
    var base = ["a", "b", "c"];
    expect(permutils.nextWrapping(base, "a")).to.equal("b");
    expect(permutils.nextWrapping(base, "b")).to.equal("c");
    expect(permutils.nextWrapping(base, "c")).to.equal("a");
    expect(permutils.nextWrapping(base, "d")).to.equal(undefined);
    expect(permutils.nextWrapping([], "a")).to.equal(undefined);
  });

  it('factorial', function() {
    expect(calling(permutils.factorial).withArgs(-1)).to.throw();
    expect(calling(permutils.factorial).withArgs(1.5)).to.throw();
    expect(permutils.factorial(0)).to.eq(1);
    expect(permutils.factorial(1)).to.eq(1);
    expect(permutils.factorial(2)).to.eq(2);
    expect(permutils.factorial(3)).to.eq(6);
    expect(permutils.factorial(4)).to.eq(24);
  });

  it('factoriadic', function() {
    expect(permutils.factoriadic([0, 2, 2])).to.eq(-1);
    expect(calling(permutils.factoriadic).withArgs(outOfFactoriadicRange)).to.throw();

    _.each(allPermsLength3, function(x, i) {
      var tmp = _.map(x);
      expect(permutils.factoriadic(x)).to.eq(i);
      expect(_.isEqual(tmp, x)).to.eq(true);
    });
  });

  it('unfactoriadic', function() {
    expect(calling(permutils.unfactoriadic).withoutArgs()).to.throw();
    expect(calling(permutils.unfactoriadic).withArgs('a')).to.throw();
    expect(calling(permutils.unfactoriadic).withArgs(1, 'a')).to.throw();
    expect(calling(permutils.unfactoriadic).withArgs(19, 19)).to.throw();
    expect(permutils.unfactoriadic(1, -1)).to.eq(null);
    expect(permutils.unfactoriadic(-1, 1)).to.eq(null);

    _.each(allPermsLength3, function(x, i) {
      var tmp = _.map(x);
      expect(permutils.unfactoriadic(i, 3)).to.satisfy(eqs(x));
      expect(_.isEqual(tmp, x)).to.eq(true);
    });
  });

  it('inverse', function() {
    expect(permutils.inverse(invalid[0])).to.eq(null);
    var base = ["a", "b", "c"];
    _.times(6, function(i) {
      var inst = ["a", "b", "c"];
      var inv = permutils.inverse(allPermsLength3[i]);
      expect(inv).to.satisfy(eqs(allPermsLength3Invs[i]));
      expect(permutils.permute(inst, allPermsLength3[i], inv));
    });
  });

});