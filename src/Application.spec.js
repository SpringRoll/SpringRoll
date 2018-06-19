import { Application } from './Application';
import { ApplicationPlugin } from './ApplicationPlugin';

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

    it('should run preload on all plugins and then emit an init event', (done) => {
      var plugin = new ApplicationPlugin();
      plugin.called = false;
      plugin.preload = () => plugin.called = true;
      Application.uses(plugin);

      var app = new Application();
      app.on('init', function() {
        expect(plugin.called).to.be.true;
        done();
      });
    });
  });

  describe('event emitting', () => {
    it('should call a callback if it is registered for an event', (done) => {
      var app = new Application();
      app.on('hello', function(data) {
        expect(data).to.equal('world');
        done();
      });
      app.emit('hello', 'world');
    });
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
