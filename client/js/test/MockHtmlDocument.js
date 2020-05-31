const MockHtmlElement = require(process.cwd() + '/client/js/test/MockHtmlElement.js');

// Mocks the document object of an HTML page.
class MockHtmlDocument {
  constructor() {
    this.elements = {};   // Map of mock elements
  }

  // Retrieves a MockHtmlElement associated with the given id.
  //
  // If no element matches the id, a new one is created.
  getElementById(id) {
    if (!this.elements.hasOwnProperty(id)) {
      this.elements[id] = new MockHtmlElement();
    }

    return this.elements[id];
  }
}

module.exports = MockHtmlDocument;
