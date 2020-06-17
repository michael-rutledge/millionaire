const HotSeatActionButton = require('./HotSeatActionButton.js');

class HotSeatActionButtonBuilder {
  constructor(canvas) {
    this._hotSeatActionButton = new HotSeatActionButton(canvas);
  }

  build() {
    return this._hotSeatActionButton;
  }

  setAvailable(available) {
    this._hotSeatActionButton.available = available;
    return this;
  }

  setIcon(icon) {
    this._hotSeatActionButton.icon = icon;
    return this;
  }

  setOutlineColor(outlineColor) {
    this._hotSeatActionButton.outlineColor = outlineColor;
    return this;
  }

  setPosition(x, y) {
    this._hotSeatActionButton.x = x;
    this._hotSeatActionButton.y = y;
    return this;
  }

  setSocket(socket) {
    this._hotSeatActionButton.socket = socket;
    return this;
  }

  setSocketEvent(socketEvent) {
    this._hotSeatActionButton.socketEvent = socketEvent;
    return this;
  }

  setText(text) {
    this._hotSeatActionButton.text = text;
    return this;
  }

  setUsed(used) {
    this._hotSeatActionButton.used = used;
    return this;
  }
}

module.exports = HotSeatActionButtonBuilder;