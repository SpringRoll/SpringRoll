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
});
