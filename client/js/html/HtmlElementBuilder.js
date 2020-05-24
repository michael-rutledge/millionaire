class HtmlElementBuilder {

  constructor() {
    this.htmlElement = {};
  }


  // PUBLIC METHODS
  build() {
    return this.htmlElement;
  }

  setClassList(classList) {
    this.htmlElement.classList = classList;
    return this;
  }

  setId(id) {
    this.htmlElement.id = id;
    return this;
  }

  setInnerHtml(innerHtml) {
    this.htmlElement.innerHtml = innerHtml;
    return this;
  }

  setTag(tag) {
    this.htmlElement.tag = tag;
    return this;
  }

  // Returns the innerHtml string representation of the html element.
  toInnerHtml() {
    var innerHtml = '<' + this.htmlElement.tag;

    if (this.htmlElement.classList !== undefined) {
      innerHtml += ' class="' + this.htmlElement.classList.join(' ') + '"';
    }
    if (this.htmlElement.id) {
      innerHtml += ' id="' + this.htmlElement.id + '"';
    }
    innerHtml += '>';
    if (this.htmlElement.innerHtml !== undefined) {
      innerHtml += this.htmlElement.innerHtml;
    }
    innerHtml += '</' + this.htmlElement.tag + '>';

    return innerHtml;
  }
}

module.exports = HtmlElementBuilder;