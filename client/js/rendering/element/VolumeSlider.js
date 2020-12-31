const CanvasElement = require('./CanvasElement.js');
const Constants = require('../Constants.js');
const LocalizedStrings = require('../../../../localization/LocalizedStrings.js');
const Fonts = require('../Fonts.js');
const SliderBuilder = require('./SliderBuilder.js');

// Slider that controls volume on the client.
class VolumeSlider extends CanvasElement {
  constructor(canvas, audioPlayer) {
    super(canvas);
    this.audioPlayer = audioPlayer;
    this.currentVolume = audioPlayer.currentVolume;

    var sliderX = this.canvas.height * (Constants.BOTTOM_SIDE_HEIGHT_RATIO * 0.5);
    var sliderY = this.canvas.height * (1 - Constants.BOTTOM_SIDE_HEIGHT_RATIO * 0.75);
    var sliderBubbleWidth = this.canvas.height * Constants.BOTTOM_SIDE_HEIGHT_RATIO * 0.75;
    var sliderBubbleHeight = 30;

    this.slider =
      new SliderBuilder(canvas)
        .setPosition(sliderX, sliderY)
        .setBubbleDimensions(sliderBubbleWidth, sliderBubbleHeight)
        .setHeaderText(LocalizedStrings.VOLUME_SLIDER_LABEL)
        .setValue(this.currentVolume)
        .build();

    this.onClick = (x, y) => { this.slider.onClick(x, y); };
    this.onMouseUp = (x, y) => { this.slider.onMouseUp(x, y); };
    this.onMouseMove = (x, y) => { this.slider.onMouseMove(x, y); };
  }


  // PUBLIC METHODS

  draw() {
    this.slider.draw();
    if (this.currentVolume !== this.slider.value) {
      this.currentVolume = this.slider.value;
      this.audioPlayer.setGlobalVolume(this.currentVolume);
    }
  }

  // Returns whether the mouse is hovering over the slider.
  isMouseHovering(x, y) {
    return this.slider.isMouseHovering(x, y);
  }
}

module.exports = VolumeSlider;