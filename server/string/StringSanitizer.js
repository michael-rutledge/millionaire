const sanitizeHtml = require('sanitize-html');

// Returns an HTML-safe version of the given string, leaving allowed tags (e.g. 'i', 'b').
function getHtmlSanitized(dirty, allowedTags = []) {
  return sanitizeHtml(dirty, {
    allowedTags: allowedTags,
  });
}

module.exports.getHtmlSanitized = getHtmlSanitized;
