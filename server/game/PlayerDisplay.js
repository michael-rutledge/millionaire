const DEFAULT = 0;
const HOT_SEAT = 1;
const SELECTED = 2;

// Returns the display style suited for the given player.
function getDisplayFromPlayer(player) {
  if (player.isHotSeatPlayer) {
    return HOT_SEAT;
  } else if (player.selectedForPhoneAFriend) {
    return SELECTED;
  } else {
    return DEFAULT;
  }
}

module.exports.DEFAULT = DEFAULT;
module.exports.HOT_SEAT = HOT_SEAT;
module.exports.SELECTED = SELECTED;

module.exports.getDisplayFromPlayer = getDisplayFromPlayer;