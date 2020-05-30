const expect = require('chai').expect;

const StepDialog = require(process.cwd() + '/server/game/StepDialog.js');

describe('StepDialogTest', () => {
  it('constructorShouldNotSetTimeOutIfNoneProvided', () => {
    var stepDialog = new StepDialog(/*actions=*/[]);

    expect(stepDialog.timeout).to.be.undefined;
  });

  it('constructorShouldSetTimeOutIfProvided', () => {
    var stepDialog = new StepDialog(
      /*actions=*/[],
      /*timeoutFunc=*/() => {},
      /*timeoutMs=*/5000);

    expect(stepDialog.timeout).to.not.be.undefined;
    stepDialog.clearTimeout();
  });

  it('clearTimeoutShouldGiveExpectedResultForTimeout', () => {
    var stepDialog = new StepDialog(
      /*actions=*/[],
      /*timeoutFunc=*/() => {},
      /*timeoutMs=*/5000);

    stepDialog.clearTimeout();

    expect(stepDialog.timeoutActive()).to.be.false;
  });

  it('clearTimeoutShouldGiveExpectedResultForNoTimeout', () => {
    var stepDialog = new StepDialog(/*actions=*/[]);

    stepDialog.clearTimeout();

    expect(stepDialog.timeoutActive()).to.be.false;
  });

  it('toCompressedShouldGiveExpectedResult', () => {
    var stepDialog = new StepDialog(
      /*actions=*/[{
        socketEvent: 'socketEvent',
        text: 'text'
      }],
      /*timeoutFunc=*/undefined,
      /*timeoutMs=*/undefined,
      /*header=*/'header');

    var compressed = stepDialog.toCompressed();

    expect(compressed).to.deep.equal({
      actions: [{
        socketEvent: 'socketEvent',
        text: 'text'
      }],
      header: 'header'
    });
  });
});