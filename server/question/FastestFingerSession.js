const fs = require('fs');

const DataLevel = require(process.cwd() + '/server/question/DataLevel.js');
const FastestFingerQuestion = require(process.cwd() + '/server/question/FastestFingerQuestion.js');

const FILE_PATH = DataLevel.isDev() ?
  process.cwd() + '/test/server/question/MockFastestFingerQuestions.json' :
  process.cwd() + '/server/question/FastestFingerQuestions.json';
const QUESTIONS = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));

// Generates FastestFingerQuestions within a session.
class FastestFingerSession {

  constructor(playerMap) {
    this.playerMap = playerMap;
    this._refreshQuestions();
  }


  // PRIVATE METHODS

  // Refreshes the index map of open questions to refresh the session's question generation.
  _refreshQuestions() {
    this.openQuestions = {};
    for (var i = 0; i < QUESTIONS.length; i++) {
      this.openQuestions[i] = i;
    }
  }

  // Returns a new random index of a question that hasn't been used yet.
  _getNewOpenIdex() {
    var openIndexindex = Math.trunc(Math.random() * Object.keys(this.openQuestions).length);
    return Object.values(this.openQuestions)[openIndexindex];
  }


  // PUBLIC METHODS

  // Returns a new FastestFingerQuestion for this session.
  //
  // Uses up the question and makes sure it never gets asked again until all questions are used up
  // for this session.
  getNewQuestion() {
    var openIndex = this._getNewOpenIdex();
    delete this.openQuestions[openIndex];
    if (Object.keys(this.openQuestions).length < 1) {
      this._refreshQuestions();
    }
    return new FastestFingerQuestion(QUESTIONS[openIndex], this.playerMap);
  }
}

module.exports = FastestFingerSession;
FastestFingerSession.QUESTIONS = QUESTIONS;