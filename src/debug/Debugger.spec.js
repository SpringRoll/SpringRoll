import Debugger from './Debugger';

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

  it('assert should test truthiness of argument', done => {
    bugger.assert(true === true, () => done(), () => done(Error));
  });

  it('assert should call false callback if truthiness of argument is false', done => {
    bugger.assert(true !== true, () => done(Error), () => done());
  });
});
