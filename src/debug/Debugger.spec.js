import { Debugger } from './Debugger';

describe('Debugger', () => {
  it('Should emit when the appropriate log level is assigned', () => {
    expect(Debugger.log('general', 'test general')).to.be.true;
    expect(Debugger.log('debug', 'test debug')).to.be.true;
    expect(Debugger.log('info', 'test info')).to.be.true;
    expect(Debugger.log('warn', 'test warn')).to.be.true;
    expect(Debugger.log('error', 'test error')).to.be.true;
  });
  it('should not emit when the level is higher than the log level', () => {
    Debugger.minLevel('error');

    expect(Debugger.log('general', 'test general')).to.be.false;
    expect(Debugger.log('debug', 'test debug')).to.be.false;
    expect(Debugger.log('info', 'test info')).to.be.false;
    expect(Debugger.log('warn', 'test warn')).to.be.false;
    expect(Debugger.log('error', 'test error')).to.be.true;
  });

  it('assert should do nothing if true', () => {
    Debugger.assert(true);
  });

  it('assert should throw if false ', done => {
    try {
      Debugger.assert(false);
      done(new Error());
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      done();
    }
  });

  it('Nothing should run if global flag is set to false', () => {
    Debugger.enable(false);
    expect(Debugger.log('general', 'test general')).to.be.undefined;
    expect(Debugger.log('debug', 'test debug')).to.be.undefined;
    expect(Debugger.log('info', 'test info')).to.be.undefined;
    expect(Debugger.log('warn', 'test warn')).to.be.undefined;
    expect(Debugger.log('error', 'test error')).to.be.undefined;
  });
});
