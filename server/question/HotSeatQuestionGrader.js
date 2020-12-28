const PlayerMap = require(process.cwd() + '/server/game/PlayerMap.js');

// Payouts per question.
const PAYOUTS = [
  100,
  200,
  300,
  500,
  1000,
  2000,
  4000,
  8000,
  16000,
  32000,
  64000,
  125000,
  250000,
  500000,
  1000000
];

// Baseline payouts for audience members if they are correct.
const AUDIENCE_BASELINE_PAYOUTS = [
  50,
  50,
  50,
  50,
  50,
  500,
  500,
  500,
  500,
  500,
  16000,
  16000,
  16000,
  16000,
  16000
]

// Grades and calculates audience payouts for hot seat questions.
class HotSeatQuestionGrader {

  constructor(playerMap = new PlayerMap()) {
    this.playerMap = playerMap;

    this.correctChoice = undefined;
    this.hotSeatPlayerChoice = undefined;
    this.questionIndex = 0;
    this.startTime = undefined;

    this.askTheAudienceLifeline = undefined;
    this.phoneAFriendLifeline = undefined;
    this.fiftyFiftyLifeline = undefined;
    this.walkingAway = false;
  }


  // PRIVATE METHODS

  // Returns whether a lifeline has been used yet.
  _lifelineUsed() {
    return this.askTheAudienceLifeline !== undefined || this.phoneAFriendLifeline !== undefined
      || this.fiftyFiftyLifeline !== undefined;
  }

  // Returns whether the given player persuaded the hot seat player to make a choice via Ask the
  // Audience.
  _playerAudiencePersuadedHotSeat(player) {
    return this.askTheAudienceLifeline !== undefined
      && player.hotSeatChoice == this.hotSeatPlayerChoice; 
  }

  // Returns whether the given player persuaded the hot seat player to make a choice via the Phone A
  // Friend lifeline.
  _playerPhonePersuadedHotSeat(player) {
    return this.phoneAFriendLifeline !== undefined && player == this.phoneAFriendLifeline.friend
      && player.hotSeatChoice == this.hotSeatPlayerChoice;
  }


  // PUBLIC METHODS

  // Grades the question for contestants, paying them a scaled percentage of the money of the
  // question worth.
  grade() {
    this.playerMap.doAll((player) => {
      if (player.isContestant()) {
        // First, we set the baseline amount, as audience members should be well behind the hot seat
        // player as they risk their way closer to the next milestone.
        var baselinePayout = AUDIENCE_BASELINE_PAYOUTS[this.questionIndex];
        // We also set a scaled percentage, which will represent any modifiers on the current
        // question payout. This comes into play for sabotage and helping the hot seat player on a
        // lifeline.
        var scaledPercentage = 0;
        var phonePersuadedHotSeat = this._playerPhonePersuadedHotSeat(player);
        var audiencePersuadedHotSeat = this._playerAudiencePersuadedHotSeat(player);
        var scaledPayout = 0;

        // Double audience payout on lifeline use.
        if (this._lifelineUsed()) {
          baselinePayout *= 2;
        }

        // Set modifiers for persuading on a lifeline.
        scaledPercentage = phonePersuadedHotSeat ?
          this.phoneAFriendLifeline.friendConfidence * 0.75
          : scaledPercentage;
        scaledPercentage = audiencePersuadedHotSeat ?
          Math.max(0.5, scaledPercentage) : scaledPercentage;

        // Apply incorrect punishments.
        if (player.hotSeatChoice != this.correctChoice) {
          baselinePayout = 0;
          scaledPercentage *= -1;

          if (!phonePersuadedHotSeat && !audiencePersuadedHotSeat) {
            scaledPercentage *= 0;
          }
        }

        scaledPayout = Math.floor(PAYOUTS[this.questionIndex] * scaledPercentage);
        player.money += Math.abs(scaledPayout) > baselinePayout ? scaledPayout : baselinePayout;
      }
    });
  }

  setAskTheAudienceLifeline(askTheAudienceLifeline) {
    this.askTheAudienceLifeline = askTheAudienceLifeline;
    return this;
  }

  setCorrectChoice(correctChoice) {
    this.correctChoice = correctChoice;
    return this;
  }

  setFiftyFiftyLifeline(fiftyFiftyLifeline) {
    this.fiftyFiftyLifeline = fiftyFiftyLifeline;
    return this;
  }

  setHotSeatPlayerChoice(hotSeatPlayerChoice) {
    this.hotSeatPlayerChoice = hotSeatPlayerChoice;
    return this;
  }

  setPhoneAFriendLifeline(phoneAFriendLifeline) {
    this.phoneAFriendLifeline = phoneAFriendLifeline;
    return this;
  }

  setQuestionIndex(questionIndex) {
    this.questionIndex = questionIndex;
    return this;
  }

  setStartTime(startTime) {
    this.startTime = startTime;
    return this;
  }

  setWalkingAway(walkingAway) {
    this.walkingAway = walkingAway;
    return this;
  }
}

module.exports = HotSeatQuestionGrader;
HotSeatQuestionGrader.PAYOUTS = PAYOUTS;