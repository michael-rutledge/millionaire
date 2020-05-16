const expect = require('chai').expect;

const StringSanitizer = require(process.cwd() + '/server/string/StringSanitizer.js');

describe('StringSanitizerTest', () => {
  it('getHtmlSanitizedShouldGiveExpectedResult', () => {
    expect(StringSanitizer.getHtmlSanitized('<b>foo</b>')).to.equal('foo');
  });

  it('getHtmlSanitizedShouldAllowSpecifiedTags', () => {
    expect(StringSanitizer.getHtmlSanitized('<b>foo</b>', ['b'])).to.equal('<b>foo</b>');
  });
});
