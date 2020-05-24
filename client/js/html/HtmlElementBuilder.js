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

  setInnerHTML(innerHTML) {
    this.htmlElement.innerHTML = innerHTML;
    return this;
  }

  setTag(tag) {
    this.htmlElement.tag = tag;
    return this;
  }

  // Returns the innerHTML string representation of the html element.
  toInnerHTML() {
    var innerHTML = '<' + this.htmlElement.tag;

    if (this.htmlElement.classList !== undefined) {
      innerHTML += ' class="' + this.htmlElement.classList.join(' ') + '"';
    }
    if (this.htmlElement.id) {
      innerHTML += ' id="' + this.htmlElement.id + '"';
    }
    innerHTML += '>';
    if (this.htmlElement.innerHTML !== undefined) {
      innerHTML += this.htmlElement.innerHTML;
    }
    innerHTML += '</' + this.htmlElement.tag + '>';

    return innerHTML;
  }
}

module.exports = HtmlElementBuilder;