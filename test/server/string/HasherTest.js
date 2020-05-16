const expect = require('chai').expect;

const Hasher = require(process.cwd() + '/server/string/Hasher.js');

describe('HasherTest', () => {
  it('genHashShouldGiveExpectedLength', () => {
    var hashLength = 4;

    expect(Hasher.genHash(hashLength)).to.have.lengthOf(hashLength);
  });

  it('genHashShouldBeEmptyForLengthZero', () => {
    expect(Hasher.genHash(0)).to.be.empty;
  });
});
