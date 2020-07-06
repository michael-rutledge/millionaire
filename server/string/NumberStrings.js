// This file contains functions for formatting numbers as strings.


// Returns the string representation of the given percentage.
function getPercentageString(percentage) {
  if (percentage !== 0 && !percentage) {
    return 'NaN';
  }

  return Math.floor(percentage * 100) + '%';
}

// Returns the string format of the given amount of dollars.
function getMoneyString(money) {
  var moneyString = '';
  var isNegative = money < 0;

  money = Math.abs(money);

  while (money > 0) {
    var chunkString = Math.abs(money % 1000).toString();
    money = Math.floor(money / 1000);
    for (var i = chunkString.length; i < 3 && money > 0; i++) {
      chunkString = '0' + chunkString;
    }
    moneyString = (money > 0 ? ',' : '') + chunkString + moneyString;
  }

  return (isNegative ? '-' : '') + '$' + (moneyString.length <= 0 ? '0' : moneyString);
}

module.exports.getMoneyString = getMoneyString;
module.exports.getPercentageString = getPercentageString;