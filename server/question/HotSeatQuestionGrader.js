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

// Window of percentage money that can be won on a question, depending on how long it takes to
// choose.
const PERCENT_CEILING = 0.5;
const PERCENT_FLOOR = 0.2;

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

  // Returns the percentage of money for a question to give to a contestant for their answer to a
  // hot seat question.
  _getScaledPercentage(elapsedTime) {
    const bestWindowMs = 1000;
    const timeWindowMs = 10000;

    var trimmedElapsedTime = Math.max(0, Math.min(elapsedTime - bestWindowMs, timeWindowMs));
    var timeRatio = 1 - (trimmedElapsedTime / timeWindowMs);
    return PERCENT_FLOOR + timeRatio * (PERCENT_CEILING - PERCENT_FLOOR);
  }

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
      if (player.isContestant() && player.hotSeatTime !== undefined) {
        var elapsedTime = player.hotSeatTime - this.startTime;
        var scaledPercentage = this._getScaledPercentage(elapsedTime);
        var phonePersuadedHotSeat = this._playerPhonePersuadedHotSeat(player);
        var audiencePersuadedHotSeat = this._playerAudiencePersuadedHotSeat(player);

        // Assume correctness for scaledPercentage calculation
        scaledPercentage = this._lifelineUsed() ? PERCENT_CEILING : scaledPercentage;
        scaledPercentage = this.walkingAway ? PERCENT_FLOOR : scaledPercentage;
        scaledPercentage = phonePersuadedHotSeat ?
          scaledPercentage + this.phoneAFriendLifeline.friendConfidence / 2
          : scaledPercentage;
        scaledPercentage = audiencePersuadedHotSeat ?
          Math.max(0.75, scaledPercentage) : scaledPercentage;

        // Apply incorrect punishments
        if (player.hotSeatChoice != this.correctChoice) {
          if (!phonePersuadedHotSeat && !audiencePersuadedHotSeat) {
            scaledPercentage *= 0;
          }

          scaledPercentage = phonePersuadedHotSeat && !audiencePersuadedHotSeat ?
            this.phoneAFriendLifeline.friendConfidence : scaledPercentage;
          scaledPercentage = audiencePersuadedHotSeat ?
            Math.max(0.75, scaledPercentage) : scaledPercentage;
          scaledPercentage *= -1;
        }

        player.money += PAYOUTS[this.questionIndex] * scaledPercentage;
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

  setPhonedFriend(phonedFriend) {
    this.phonedFriend = phonedFriend;
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
HotSeatQuestionGrader.PERCENT_CEILING = PERCENT_CEILING;
HotSeatQuestionGrader.PERCENT_FLOOR = PERCENT_FLOOR;