// Encapsulates an element that is to be drawn on the game canvas.
class CanvasElement {
  constructor(canvas, x = 0, y = 0, onClick = undefined) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.x = x;
    this.y = y;
    this.onClick = onClick;
    this.onMouseUp = undefined;
  }

  // Returns whether the element can be clicked on.
  isClickable() {
    return this.onClick !== undefined;
  }

  // Returns whether the mouse is hovering over this element.
  isMouseHovering(x, y) {
    return false;
  }

  // Draws the element on the canvas.
  draw() {
    // unimplemented; placed here purely for safeguarding against misuse
  }
}

module.exports = CanvasElement;