const A = 0;
const B = 1;
const C = 2;
const D = 3;
const MAX_CHOICES = 4;
const VALID_CHOICES = new Set([A, B, C, D]);

// Returns whether the given choices is valid.
function isValidChoice(choice) {
  return VALID_CHOICES.has(choice);
}

module.exports.A = A;
module.exports.B = B;
module.exports.C = C;
module.exports.D = D;
module.exports.MAX_CHOICES = MAX_CHOICES;
module.exports.isValidChoice = isValidChoice;