const choices = 'abcdefghijklmnopqrstuvwxyz0123456789';
const DEFAULT_LENGTH = 7;

function genHash(length) {
    var text = '';

    for (var i = 0; i < length; i++) {
        text += choices.charAt(Math.floor(Math.random() * choices.length));
    }
    return text;
}

module.exports.genHash = genHash;
