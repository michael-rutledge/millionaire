// Encapsulates a confirmation dialog that steps the game.
//
// Can hold multiple actions in order to support dialogs with different options.
class StepDialog {

  // Expected format of action within actions array: {
  //   string socketEvent
  //   string text
  // }
  //
  // timeoutData can be undefined in the instance that no hard timer on a dialog is necessary.
  constructor(actions = [], timeoutFunc = undefined, timeoutMs = undefined, header = '') {
    this.actions = actions;
    this.header = '';

    if (timeoutFunc !== undefined && timeoutMs !== undefined) {
      this.timeout = setTimeout(timeoutFunc, timeoutMs);
    }
  }


  // PUBLIC METHODS

  // Compresses the StepAction to digestable JSON for the client to unpack for rendering.
  toCompressed() {
    return {
      actions: this.actions,
      header: this.header
    };
  }
}

module.exports = StepDialog;