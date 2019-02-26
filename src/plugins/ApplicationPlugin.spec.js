import { ApplicationPlugin } from './ApplicationPlugin';

describe('ApplicationPlugin', () => {
  it('should throw if no name is configured for the plugin', () => {
    expect(() => {
      new ApplicationPlugin({});
    }).to.throw();
  });

  it('should attach the configured name to the plugin', () => {
    const plugin = new ApplicationPlugin({ name: 'test' });
    expect(plugin.name).to.equal('test');
  });
});
