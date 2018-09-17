import { Application } from './Application';
import { ApplicationPlugin } from './plugins/ApplicationPlugin';

class CustomPlugin extends ApplicationPlugin {
  constructor() {
    super({ name: 'custom' });
  }

  setup(application) {
    this.setupCalled = true;
    expect(application).to.be.instanceOf(Application);
  }

  preload(application) {
    this.preloadCalled = true;
    expect(application).to.be.instanceOf(Application);
    return Promise.resolve();
  }
}

describe('Application', () => {
  beforeEach(() => {
    // remove any old plugins
    Application._plugins = [];
  });

  describe('constructor', () => {
    it('should call setup on all registered plugins', () => {
      const plugin = new CustomPlugin();
      Application.uses(plugin);
      const app = new Application();
      expect(plugin.setupCalled).to.be.true;
    });

    it('should call setup in the correct order for plugins with dependencies', () => {
      let aSetupCalled = false;
      const a = new ApplicationPlugin({ name: 'a' });
      a.setup = () => aSetupCalled = true;

      // b checks that a is setup first
      const b = new ApplicationPlugin({ name: 'b', required: ['a'] });
      b.setup = () => expect(aSetupCalled).to.be.true;

      Application.uses(b);
      Application.uses(a);

      const app = new Application();
    });

    it('should run preload on all plugins and then notify listeners that the app is ready', done => {
      const plugin = new CustomPlugin();
      Application.uses(plugin);

      const app = new Application();
      app.state.ready.subscribe(function(isReady) {
        expect(isReady).to.be.true;
        expect(plugin.preloadCalled).to.be.true;
        done();
      });
    });

    it('should call preload in the correct order for plugins with dependencies', () => {
      let aPreloadCalled = false;
      const a = new ApplicationPlugin({ name: 'a' });
      // a preload that takes some time
      a.preload = () => {
        return new Promise(resolve => {
          setTimeout(() => {
            aPreloadCalled = true;
            resolve();
          }, 10);
        });
      };

      // b checks that a is setup first
      const b = new ApplicationPlugin({ name: 'b', required: ['a'] });
      b.preload = () => {
        expect(aPreloadCalled).to.be.true;
        return Promise.resolve();
      }

      Application.uses(b);
      Application.uses(a);

      const app = new Application();
    });

    it('should throw if a plugin is missing a required dependency', () => {
      const plugin = new ApplicationPlugin({
        name: 'b',
        required: ['a']
      });

      Application.uses(plugin);

      expect(() => {
        new Application();
      }).to.throw();
    });

    it('should default features to false for ones that are not set', () => {
      const application = new Application({ captions: true });
      expect(application.features.captions).to.equal(true);
      expect(application.features.sound).to.equal(false);
    });

    it('should mark sound enabled if vo is marked as a feature', () => {
      const application = new Application({ sound: false, vo: true });
      expect(application.features.vo).to.equal(true);
      expect(application.features.sound).to.equal(true);
    });

    it('should mark sound enabled if music is enabled', () => {
      const application = new Application({ sound: false, music: true });
      expect(application.features.music).to.equal(true);
      expect(application.features.sound).to.equal(true);
    });

    it('should mark sound enabled if sfx is enabled', () => {
      const application = new Application({ sound: false, sfx: true });
      expect(application.features.sfx).to.equal(true);
      expect(application.features.sound).to.equal(true);
    });
  });

  describe('validatePlugins', () => {
    it('should return an empty array if all dependencies are in place', () => {
      const pluginA = new ApplicationPlugin({ name: 'a' });
      const pluginB = new ApplicationPlugin({ name: 'b', required: ['a'] });
      Application.uses(pluginB);
      Application.uses(pluginA);

      expect(Application.validatePlugins()).to.deep.equal([]);
    });

    it('should return a list of errors if there are missing dependencies', () => {
      const pluginB = new ApplicationPlugin({ name: 'b', required: ['a'] });
      Application.uses(pluginB);

      expect(Application.validatePlugins()).to.deep.equal([
        'Application plugin "b" missing required plugins "a"'
      ]);
    });
  });

  describe('sortPlugins', () => {
    it('should allow no plugins to be provided', () => {
      Application.sortPlugins();
    });

    it('should place plugins\' dependency plugins before the actual plugin', () => {
      const dependant = new ApplicationPlugin({ name: 'b', required: ['a'], optional: ['c'] });
      Application.uses(dependant);
      const dependency1 = new ApplicationPlugin({ name: 'c' });
      Application.uses(dependency1);
      const dependency2 = new ApplicationPlugin({ name: 'a' });
      Application.uses(dependency2);

      Application.sortPlugins();

      expect(Application._plugins[2]).to.equal(dependant);
    });

    it('should properly sort chains of dependencies', () => {
      const b = new ApplicationPlugin({ name: 'b', optional: ['c'] });
      Application.uses(b);
      const c = new ApplicationPlugin({ name: 'c', required: ['a'] });
      Application.uses(c);
      const a = new ApplicationPlugin({ name: 'a' });
      Application.uses(a);

      Application.sortPlugins();

      expect(Application._plugins[0]).to.equal(a);
      expect(Application._plugins[1]).to.equal(c);
      expect(Application._plugins[2]).to.equal(b);
    });

    it('should properly handle missing optional dependencies', () => {
      const b = new ApplicationPlugin({ name: 'b', optional: ['c'] });
      Application.uses(b);

      Application.sortPlugins();

      expect(Application._plugins[0]).to.equal(b);
    });

    it('should throw an Error if there is a cyclic dependency between plugins', () => {
      const b = new ApplicationPlugin({ name: 'b', optional: ['c'] });
      Application.uses(b);
      const c = new ApplicationPlugin({ name: 'c', required: ['a'] });
      Application.uses(c);
      const a = new ApplicationPlugin({ name: 'a', optional: ['b'] });
      Application.uses(a);

      expect(() => Application.sortPlugins()).to.throw();
    });
  });
});
