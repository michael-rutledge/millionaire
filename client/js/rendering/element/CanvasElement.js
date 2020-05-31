// Encapsulates an element that is to be drawn on the game canvas.
class CanvasElement {
  constructor(x = 0, y = 0, onClick = undefined) {
    this.x = x;
    this.y = y;
    this.onClick = onClick;
  }

  // Returns whether the element can be clicked on.
  isClickable() {
    return this.onClick !== undefined;
  }

  // Draws the element on the given canvas context.
  drawOnCanvas(canvas) {
    // unimplemented; placed here purely for safeguarding against misuse
  }
}

module.exports = CanvasElement;