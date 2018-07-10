import { Application } from './Application';
import { ApplicationPlugin } from './plugins/ApplicationPlugin';

describe('Application', () => {
  beforeEach(() => {
    // remove any old plugins
    Application._plugins = [];
  });

  describe('constructor', () => {
    it('should call setup on all registered plugins', () => {
      var plugin = new ApplicationPlugin();
      plugin.called = false;
      plugin.setup = () => plugin.called = true;
      Application.uses(plugin);

      var app = new Application();

      expect(plugin.called).to.be.true;
    });

    it('should run preload on all plugins and then notify listeners that the app is ready', (done) => {
      var plugin = new ApplicationPlugin();
      plugin.called = false;
      plugin.preload = () => plugin.called = true;
      Application.uses(plugin);

      var app = new Application();
      app.state.ready.subscribe(function(value) {
        expect(value).to.be.true;
        expect(plugin.called).to.be.true;
        done();
      });
    });

    it('should default features to false for ones that are not set', () => {
      let application = new Application({ captions: true });
      expect(application.features.captions).to.equal(true);
      expect(application.features.sound).to.equal(false);
    });

    it('should mark sound enabled if vo is marked as a feature', () => {
      let application = new Application({ sound: false, vo: true });
      expect(application.features.vo).to.equal(true);
      expect(application.features.sound).to.equal(true);
    });

    it('should mark sound enabled if music is enabled', () => {
      let application = new Application({ sound: false, music: true });
      expect(application.features.music).to.equal(true);
      expect(application.features.sound).to.equal(true);
    });
    
    it('should mark sound enabled if sfxButton is enabled', () => {
      let application = new Application({ sound: false, sfxButton: true });
      expect(application.features.sfxButton).to.equal(true);
      expect(application.features.sound).to.equal(true);
    })
  });

  describe('promisify', () => {
    it('should properly map preload methods that use a callback with success', (done) => {
      var app = new Application();

      var f = callback => callback();

      var result = app.promisify(f);
      expect(result).to.be.instanceOf(Promise);
      result.then(done).catch(done);
    });
    
    it('should properly map preload methods that use a callback with failure', (done) => {
      var app = new Application();

      var f = callback => callback(new Error('something failed!'));

      var result = app.promisify(f);
      expect(result).to.be.instanceOf(Promise);
      result.then(() => done('Should have failed!')).catch(e => done())
    });

    it('should properly handle methods that return a promise', (done) => {
      var app = new Application();

      var f = () => Promise.resolve();

      var result = app.promisify(f);
      expect(result).to.be.instanceOf(Promise);
      result.then(done);
    });

    it('should properly handle methods that are synchronous', (done) => {
      var app = new Application();

      var f = () => 0;

      var result = app.promisify(f);
      expect(result).to.be.instanceOf(Promise);
      result.then(done);
    });
  });
});
