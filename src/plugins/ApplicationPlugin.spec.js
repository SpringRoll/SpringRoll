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

  it('should attach the configured required plugins array to the plugin', () => {
    const plugin = new ApplicationPlugin({
      name: 'test',
      required: ['a']
    });

    expect(plugin.required).to.deep.equal(['a']);
  });

  it('should use an empty array as a default value for the required and optional fields', () => {
    const plugin = new ApplicationPlugin({ name: 'test' });
    expect(plugin.required).to.deep.equal([]);
    expect(plugin.optional).to.deep.equal([]);
  });

  it('should attach the configured optional plugins array to the plugin', () => {
    const plugin = new ApplicationPlugin({
      name: 'test',
      optional: ['a']
    });

    expect(plugin.optional).to.deep.equal(['a']);
  });
});
