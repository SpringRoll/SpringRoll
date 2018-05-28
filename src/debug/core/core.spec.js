import Config from './Config';
import Debugger from './Debugger';

beforeEach(() => {
  window.srDebuggerConfig = undefined;
});

describe('Config', () => {
  it('By default new instances of the Debug config should reference the global config', () => {
    const d = new Config();
    const dd = new Config();

    expect(d).to.be.instanceof(Config);
    expect(dd).to.equal(d);
  });
});

describe('Debugger', () => {
  it('should be able to use local and global configs', () => {
    new Debugger({ globalConfig: false });

    expect(window.srDebuggerConfig).to.be.undefined;

    new Debugger();
    expect(window.srDebuggerConfig).to.not.be.undefined;
  });
});
