const AskTheAudienceResultsPanelBuilder = require('./AskTheAudienceResultsPanelBuilder.js');
const CanvasElement = require('./CanvasElement.js');
const Choices = require('../../../../server/question/Choices.js');
const Colors = require('../Colors.js');
const Constants = require('../Constants.js');
const Fonts = require('../Fonts.js');
const LocalizedStrings = require('../../../../localization/LocalizedStrings.js');
const TextElement = require('./TextElement.js');
const TextElementBuilder = require('./TextElementBuilder.js');

class AskTheAudienceResultsElement extends CanvasElement {

  constructor(canvas, results) {
    super(canvas);
    this.results = results;

    // Dimensions for both the audience and 
    var panelWidth = this.canvas.width * Constants.MAIN_SCREEN_SQUARE_WIDTH_RATIO * 0.3;
    var panelHeight = panelWidth * 10 / 8;
    var halfWidth = this.canvas.width * Constants.MAIN_SCREEN_SQUARE_WIDTH_RATIO / 2;
    var sidePanelWidth = this.canvas.width * Constants.BACKGROUND_SIDE_RATIO;
    var audiencePanelX = this.canvas.width / 2 + (halfWidth - panelWidth) / 2;
    var contestantPanelX = sidePanelWidth + (halfWidth - panelWidth) / 2;
    var labelFont = Fonts.ASK_THE_AUDIENCE_LABEL_FONT;
    var audienceLabelText = LocalizedStrings.ASK_THE_ADUIENCE_AUDIENCE_LABEL;
    var contestantLabelText = LocalizedStrings.ASK_THE_ADUIENCE_CONTESTANT_LABEL;
    var textHeight = TextElement.getPredictedTextHeight(this.context, labelFont), audienceLabelText;
    var verticalPadding = 10;
    var panelY = verticalPadding * 3 + textHeight;

    this.audienceLabel =
      new TextElementBuilder(this.canvas)
        .setPosition(audiencePanelX + panelWidth / 2, verticalPadding + textHeight)
        .setText(audienceLabelText)
        .setFont(labelFont)
        .setTextAlign('center')
        .build();
    this.contestantLabel =
      new TextElementBuilder(this.canvas)
        .setPosition(contestantPanelX + panelWidth / 2, verticalPadding + textHeight)
        .setText(contestantLabelText)
        .setFont(labelFont)
        .setTextAlign('center')
        .build();

    this.audiencePanel =
      new AskTheAudienceResultsPanelBuilder(this.canvas)
        .setPosition(audiencePanelX, panelY)
        .setDimensions(panelWidth, panelHeight)
        .setAnswerBuckets(this.results.aiAnswerBuckets)
        .setGradientColors([Colors.PINK, Colors.TEAL])
        .build();
    this.contestantPanel =
      new AskTheAudienceResultsPanelBuilder(this.canvas)
        .setPosition(contestantPanelX, panelY)
        .setDimensions(panelWidth, panelHeight)
        .setAnswerBuckets(this.results.contestantAnswerBuckets)
        .setGradientColors([Colors.GREEN])
        .build();
  }


  // PUBLIC METHODS

  // Draw the element on the canvas.
  draw() {
    this.audienceLabel.draw();
    this.contestantLabel.draw();
    this.audiencePanel.draw();
    this.contestantPanel.draw();
  }
}

module.exports = AskTheAudienceResultsElement;