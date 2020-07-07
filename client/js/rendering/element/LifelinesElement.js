const CanvasElement = require('./CanvasElement.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const Fonts = require('../Fonts.js');
const HotSeatActionButtonBuilder = require('./HotSeatActionButtonBuilder.js');
const LocalizedStrings = require('../../../../localization/LocalizedStrings.js');
const TextElementBuilder = require('./TextElementBuilder.js');

class LifelinesElement extends CanvasElement {

  constructor(canvas, socket, fiftyFiftyActionButton, phoneAFriendActionButton,
      askTheAudienceActionButton, walkAwayActionButton) {
    super(canvas);
    this.socket = socket;
    this.hotSeatActionButtons = [];
    this.onClick = (x, y) => {
      this._onClick(x, y);
    };

    const bottomSideHeight = this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO;

    this.lifelinesHeader =
      new TextElementBuilder(this.canvas)
        .setPosition(
          this.canvas.width - bottomSideHeight * 0.5,
          this.canvas.height - bottomSideHeight * 0.85)
        .setText(LocalizedStrings.LIFELINES_HEADER)
        .setTextAlign('center')
        .setFont(Fonts.LIFELINES_HEADER_FONT)
        .build();

    // Fifty fifty
    if (fiftyFiftyActionButton) {
      var fiftyFiftyActionButton =
        new HotSeatActionButtonBuilder(canvas)
          .setPosition(
            this.canvas.width - bottomSideHeight * 0.75,
            this.canvas.height  - bottomSideHeight * 0.6)
          .setText(LocalizedStrings.FIFTY_FIFTY)
          .setSocket(this.socket)
          .setSocketEvent(fiftyFiftyActionButton.socketEvent)
          .setOutlineColor(Colors.LIFELINE_OUTLINE)
          .setUsed(fiftyFiftyActionButton.used)
          .setAvailable(fiftyFiftyActionButton.available)
          .build();
      this.hotSeatActionButtons.push(fiftyFiftyActionButton);
    }
    // Phone a friend
    if (phoneAFriendActionButton) {
      var phoneAFriendActionButton =
        new HotSeatActionButtonBuilder(this.canvas)
          .setPosition(
            this.canvas.width - bottomSideHeight * 0.25,
            this.canvas.height  - bottomSideHeight * 0.6)
          .setText(LocalizedStrings.PHONE_A_FRIEND)
          .setSocket(this.socket)
          .setSocketEvent(phoneAFriendActionButton.socketEvent)
          .setOutlineColor(Colors.LIFELINE_OUTLINE)
          .setUsed(phoneAFriendActionButton.used)
          .setAvailable(phoneAFriendActionButton.available)
          .build();
      this.hotSeatActionButtons.push(phoneAFriendActionButton);
    }
    // Ask the audience
    if (phoneAFriendActionButton) {
      var askTheAudienceActionButton =
        new HotSeatActionButtonBuilder(this.canvas)
          .setPosition(
            this.canvas.width - bottomSideHeight * 0.75,
            this.canvas.height  - bottomSideHeight * 0.25)
          .setText('Audience')
          .setSocket(this.socket)
          .setSocketEvent(askTheAudienceActionButton.socketEvent)
          .setOutlineColor(Colors.LIFELINE_OUTLINE)
          .setUsed(askTheAudienceActionButton.used)
          .setAvailable(askTheAudienceActionButton.available)
          .build();
      this.hotSeatActionButtons.push(askTheAudienceActionButton);
    }
    // Walk away
    if (walkAwayActionButton) {
      var walkAwayActionButton =
        new HotSeatActionButtonBuilder(this.canvas)
          .setPosition(
            this.canvas.width - bottomSideHeight * 0.25,
            this.canvas.height  - bottomSideHeight * 0.25)
          .setText(LocalizedStrings.WALK_AWAY)
          .setSocket(this.socket)
          .setSocketEvent(walkAwayActionButton.socketEvent)
          .setOutlineColor(Colors.WALK_AWAY_OUTLINE)
          .setUsed(walkAwayActionButton.used)
          .setAvailable(walkAwayActionButton.available)
          .build();
      this.hotSeatActionButtons.push(walkAwayActionButton);
    }
  }


  // PRIVATE METHODS

  _onClick(x, y) {
    this.hotSeatActionButtons.forEach((button) => {
      button.onClick(x, y);
    });
  } 


  // PUBLIC METHODS

  // Draw the element on the canvas.
  draw() {
    this.lifelinesHeader.draw();
    this.hotSeatActionButtons.forEach((button) => {
      button.draw();
    });
  }

  // Returns whether the mouse is hovering over any of the lifeline buttons.
  isMouseHovering(x, y) {
    var hovering = false;

    this.hotSeatActionButtons.forEach((button) => {
      hovering = hovering || button.isMouseHovering(x, y);
    });

    return hovering;
  }
}

module.exports = LifelinesElement;