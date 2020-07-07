// This script scrapes all desired questions from opentdb.com and caches them locally.
//
// All questions, whether for fastest finger or the hot seat, use the same structure, where the
// choices are listed in the same array, with the correct choice first. An example:
//
// {
//   text: 'Who was the first US President?',
//   orderedChoices: [
//     'George Washington',
//     'Thomas Jefferson',
//     'Abraham Lincoln',
//     'John Adams'
//   ]
// }


const fs = require('fs');
const he = require('he');
const npmRequest = require('request');

// Format we expect from opentdb.com:
/*
{ category: 'General Knowledge',
   type: 'multiple',
   difficulty: 'easy',
   question: 'What?',
   correct_answer: 'yeah',
   incorrect_answers: [Array]
}
*/

const questionsByDifficulty = {
  'easy': [],
  'medium': [],
  'hard': []
};
const prettyDifficulties = {
  'easy': 'Easy',
  'medium': 'Medium',
  'hard': 'Hard'
};
const categoryMap = {
  'General Knowledge': 9,
  'Entertainment: Books': 10,
  'Entertainment: Film': 11,
  'Entertainment: Music': 12,
  'Entertainment: Musicals & Theatres': 13,
  'Entertainment: Television': 14,
  // 'Entertainment: Video Games': 15,
  'Entertainment: Board Games': 16,
  'Science & Nature': 17,
  'Science: Computers': 18,
  'Science: Mathematics': 19,
  'Mythology': 20,
  'Sports': 21,
  'Geography': 22,
  'History': 23,
  'Politics': 24,
  'Art': 25,
  'Celebrities': 26,
  'Animals': 27,
  // 'Vehicles': 28,
  // 'Entertainment: Comics': 29,
  'Science: Gadgets': 30,
  //'Entertainment: Japanese Anime & Manga': 31,
  'Entertainment: Cartoon & Animations': 32
};
var categoriesDone = 0;
var totalResults = 0;

function writeResults() {
  console.log('Should write results now.');
  for (const difficulty in questionsByDifficulty) {
    console.log('Final count for ' + difficulty + ': ' + questionsByDifficulty[difficulty].length);
    fs.writeFile(process.cwd() + '/server/question/HotSeatQuestions' +
        prettyDifficulties[difficulty] + '.json',
        JSON.stringify(questionsByDifficulty[difficulty], null, 2), 'utf8', (err) => {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }
   
      console.log("JSON file has been saved.");
    }); 
  }
  console.log('totalResults: ' + totalResults);
}

function addResultsToJsonObject(results) {
  results.forEach((object, index) => {
    var orderedChoices = [he.decode(object.correct_answer)];

    for (let i = 0; i < object.incorrect_answers.length; i++) {
      orderedChoices.push(he.decode(object.incorrect_answers[i]));
    }

    questionsByDifficulty[object.difficulty].push({
      text: he.decode(object.question),
      orderedChoices: orderedChoices
    });
  });
}

function getQuestions(sessionToken, categoryId, questionsPerCall, callback) {
  npmRequest('https://opentdb.com/api.php?amount=' + questionsPerCall + '&category=' + categoryId +
      '&type=multiple&token=' + sessionToken, (error, response, body) => {
    if (error) {
      console.log('ERROR: ' + error);
      return;
    }
    var bodyJson = JSON.parse(body);

    switch (bodyJson.response_code) {
      // ok
      case 0:
      totalResults += bodyJson.results.length;
        addResultsToJsonObject(bodyJson.results);
        getQuestions(sessionToken, categoryId, questionsPerCall, callback);
        break;
      // no results
      case 1:
        console.log('NO RESULTS');
        console.log(bodyJson);
        getQuestions(sessionToken, categoryId, questionsPerCall/2, callback);
        break;
      // invalid parameter
      case 2:
        console.log('INVALID PARAMETER');
        console.log(bodyJson);
        return;
      // token not found
      case 3:
        console.log('TOKEN NOT FOUND');
        return;
      // token empty
      case 4:
        console.log('TOKEN EMPTY');
        callback();
        if (++categoriesDone >= Object.keys(categoryMap).length) {
          writeResults();
        }
        return;
    }
  });
}


// MAIN
npmRequest('https://opentdb.com/api_token.php?command=request', (error, response, body) => {
  if (error) {
    console.log('ERROR: ' + error);
    return;
  }
  var bodyJson = JSON.parse(body)
  console.log(bodyJson);
  var sessionToken = bodyJson.token;
  for (const category in categoryMap) {
    getQuestions(sessionToken, categoryMap[category], /*questionsPerCall=*/50, () => {
      console.log('Easy: ' + questionsByDifficulty['easy'].length);
      console.log('Medium: ' + questionsByDifficulty['medium'].length);
      console.log('Hard: ' + questionsByDifficulty['hard'].length);
    });
  }
});
