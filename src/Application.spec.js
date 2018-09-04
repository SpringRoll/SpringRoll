import { Application } from './Application';
import { ApplicationPlugin } from './plugins/ApplicationPlugin';

describe('Application', () => {
  beforeEach(() => {
    // remove any old plugins
    Application._plugins = [];
  });

  describe('constructor', () => {
    it('should call setup on all registered plugins', () => {
      const plugin = new ApplicationPlugin();
      plugin.called = false;
      plugin.setup = () => (plugin.called = true);
      Application.uses(plugin);

      const app = new Application();

      expect(plugin.called).to.be.true;
    });

    it('should run preload on all plugins and then notify listeners that the app is ready', done => {
      const plugin = new ApplicationPlugin();
      plugin.called = false;
      plugin.preload = () => (plugin.called = true);
      Application.uses(plugin);

      const app = new Application();
      app.state.ready.subscribe(function(value) {
        expect(value).to.be.true;
        expect(plugin.called).to.be.true;
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

  describe('promisify', () => {
    it('should properly map preload methods that use a callback with success', done => {
      const app = new Application();

      const f = callback => callback();

      const result = app.promisify(f);
      expect(result).to.be.instanceOf(Promise);
      result.then(done).catch(done);
    });

    it('should properly map preload methods that use a callback with failure', done => {
      const app = new Application();

      const f = callback => callback(new Error('something failed!'));

      const result = app.promisify(f);
      expect(result).to.be.instanceOf(Promise);
      result.then(() => done('Should have failed!')).catch(e => done());
    });

    it('should properly handle methods that return a promise', done => {
      const app = new Application();

      const f = () => Promise.resolve();

      const result = app.promisify(f);
      expect(result).to.be.instanceOf(Promise);
      result.then(done);
    });

    it('should properly handle methods that are synchronous', done => {
      const app = new Application();

      const f = () => 0;

      const result = app.promisify(f);
      expect(result).to.be.instanceOf(Promise);
      result.then(done);
    });
  });
});
