const expect = require('chai').expect;
const should = require('chai').should();

const NumberStrings = require(process.cwd() + '/server/string/NumberStrings.js');

describe('NumberStringsTest', function () {
  describe('getPercentageString', function () {
    it('shouldGiveExpectedResultForMiddleCase', function () {
      NumberStrings.getPercentageString(0.756).should.equal('75%');
    });

    it('shouldGiveExpectedResultForTopCase', function () {
      NumberStrings.getPercentageString(1).should.equal('100%');
    });

    it('shouldGiveExpectedResultForBottomCase', function () {
      NumberStrings.getPercentageString(0).should.equal('0%');
    });

    it('shouldGiveExpectedResultForUndefinedInput', function () {
      NumberStrings.getPercentageString(undefined).should.equal('NaN');
    });
  });

  describe('getMoneyString', function () {
    it('shouldGiveExpectedResultForZero', function () {
      NumberStrings.getMoneyString(0).should.equal('$0');
    });

    it('shouldGiveExpectedResultForRoundedNumber', function () {
      NumberStrings.getMoneyString(16000).should.equal('$16,000');
    });

    it('shouldGiveExpectedResultForNoCommas', function () {
      NumberStrings.getMoneyString(100).should.equal('$100');
    });

    it('shouldGiveExpectedResultForCommas', function () {
      NumberStrings.getMoneyString(12345678).should.equal('$12,345,678');
    });

    it('shouldGiveExpectedResultForNegative', function () {
      NumberStrings.getMoneyString(-12345678).should.equal('-$12,345,678');
    });
  });
});