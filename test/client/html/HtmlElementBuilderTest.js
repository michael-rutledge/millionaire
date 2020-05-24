const expect = require('chai').expect;

const HtmlElementBuilder = require(process.cwd() + '/client/js/html/HtmlElementBuilder.js');

describe('HtmlElementBuilderTest', () => {
  it('toInnerHtmlShouldGiveExpectedResult', () => {
    var result = 
      new HtmlElementBuilder()
        .setTag('div')
        .setClassList(['class1', 'class2'])
        .setId('elemId')
        .setInnerHtml('foo text')
        .toInnerHtml();

    expect(result).to.equal('<div class="class1 class2" id="elemId">foo text</div>');
  });
});