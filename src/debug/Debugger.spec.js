import { Debugger } from './Debugger';

describe('Debugger', () => {
  const bugger = new Debugger({
    minLevel: 'GENERAL'
  });
  it('Should emit when the appropriate log level is assigned', () => {
    expect(bugger.log('general', 'test general')).to.be.true;
    expect(bugger.log('debug', 'test debug')).to.be.true;
    expect(bugger.log('info', 'test info')).to.be.true;
    expect(bugger.log('warn', 'test warn')).to.be.true;
    expect(bugger.log('error', 'test error')).to.be.true;
  });
  it('should not emit when the level is higher than the log level', () => {
    bugger.setLevel('error');

    expect(bugger.log('general', 'test general')).to.be.false;
    expect(bugger.log('debug', 'test debug')).to.be.false;
    expect(bugger.log('info', 'test info')).to.be.false;
    expect(bugger.log('warn', 'test warn')).to.be.false;
    expect(bugger.log('error', 'test error')).to.be.true;
  });

  it('assert should do nothing if true', () => {
    bugger.assert(true === true);
  });

  it('assert should throw if false ', done => {
    try {
      bugger.assert(true !== true);
      done(new Error());
    } catch (err) {
      done();
    }
  });

  it('Nothing should run if global flag is set to false', () => {
    Debugger.enable(false);
    expect(bugger.log('general', 'test general')).to.be.undefined;
    expect(bugger.log('debug', 'test debug')).to.be.undefined;
    expect(bugger.log('info', 'test info')).to.be.undefined;
    expect(bugger.log('warn', 'test warn')).to.be.undefined;
    expect(bugger.log('error', 'test error')).to.be.undefined;
  });
});
