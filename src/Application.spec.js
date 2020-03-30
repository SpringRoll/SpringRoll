import { Application, ApplicationPlugin } from './index';
import Sinon from 'sinon';

/** */
class SuccessPlugin extends ApplicationPlugin {
  /** */
  constructor() {
    super({ name: 'success plugin' });
  }

  /** */
  preload(application) {
    this.preloadCalled = true;
    expect(application).to.be.instanceOf(Application);
    return Promise.resolve();
  }

  /** */
  init(application) {
    this.initCalled = true;
    expect(application).to.be.instanceOf(Application);
  }

  /** */
  start(application) {
    this.startCalled = true;
    expect(application).to.be.instanceOf(Application);
  }
}

/** */
class FailPlugin extends ApplicationPlugin {
  /** */
  constructor() {
    super({ name: 'failed plugin' });
  }

  /** */
  preload(application) {
    this.preloadCalled = true;
    expect(application).to.be.instanceOf(Application);
    return Promise.reject('It was rigged from the start');
  }

  /** */
  init(application) {
    console.log('--------------init called!----------------------');
    this.initCalled = true;
    expect(application).to.be.instanceOf(Application);
  }

  /** */
  start(application) {
    this.startCalled = true;
    expect(application).to.be.instanceOf(Application);
  }
}

/** */
class EmptyPlugin {
  /** */
  constructor() {
    this.name = 'empty plugin';
  }
}

describe('Application', () => {
  beforeEach(() => {
    // remove any old plugins
    Application._plugins = [];
  });

  describe('constructor', () => {
    it('should default features to false for ones that are not set', () => {
      const application = new Application({ features: { captions: true } });
      expect(application.features.captions).to.equal(true);
      expect(application.features.sound).to.equal(false);
    });

    it('should mark sound enabled if vo is marked as a feature', () => {
      const application = new Application({
        features: { sound: false, vo: true }
      });
      expect(application.features.vo).to.equal(true);
      expect(application.features.sound).to.equal(true);
    });

    it('should mark sound enabled if music is enabled', () => {
      const application = new Application({
        features: { sound: false, music: true }
      });
      expect(application.features.music).to.equal(true);
      expect(application.features.sound).to.equal(true);
    });

    it('should mark sound enabled if sfx is enabled', () => {
      const application = new Application({
        features: { sound: false, sfx: true }
      });
      expect(application.features.sfx).to.equal(true);
      expect(application.features.sound).to.equal(true);
    });

    it('should run preload on all plugins and then notify listeners that the app is ready', done => {
      const plugin = new SuccessPlugin();
      Application.uses(plugin);

      const app = new Application();
      app.state.ready.subscribe(function(isReady) {
        expect(isReady).to.be.true;
        expect(plugin.preloadCalled).to.be.true;
        done();
      });
    });

    it('should continue if a plugin preload fails', done => {
      const plugin = new FailPlugin();
      Application.uses(plugin);

      const app = new Application();
      app.state.ready.subscribe(function(isReady) {
        expect(isReady).to.be.true;
        expect(plugin.preloadCalled).to.be.true;
        done();
      });
    });

    it('should continue loading other plugins if another plugins preload fails', done => {
      const pluginA = new FailPlugin();
      Application.uses(pluginA);

      const pluginB = new SuccessPlugin();
      Application.uses(pluginB);

      const app = new Application();
      app.state.ready.subscribe(function(isReady) {
        expect(isReady).to.be.true;
        expect(pluginB.preloadCalled).to.be.true;
        done();
      });
    });

    it('should not call init on a plugin that has failed its preload', done => {
      const plugin = new FailPlugin();
      Application.uses(plugin);

      const app = new Application();
      app.state.ready.subscribe(function(isReady) {
        expect(isReady).to.be.true;
        expect(!plugin.initCalled).to.be.true;
        done();
      });
    });

    it('should not call start on a plugin that has failed its preload', done => {
      const plugin = new FailPlugin();
      Application.uses(plugin);

      const app = new Application();
      app.state.ready.subscribe(function(isReady) {
        expect(isReady).to.be.true;
        expect(!plugin.startCalled).to.be.true;
        done();
      });
    });

    it('should remove plugins that fail to preload', done => {
      const plugin = new FailPlugin();
      Application.uses(plugin);

      const app = new Application();
      app.state.ready.subscribe(function(isReady) {
        expect(isReady).to.be.true;
        expect(Application._plugins.length).to.equal(0);
        done();
      });
    });

    it('should continue preloading plugins if a plugin has no preload function', done => {
      const emptyPlugin = new EmptyPlugin();
      const successPlugin = new SuccessPlugin();

      Application.uses(emptyPlugin);
      Application.uses(successPlugin);

      const app = new Application();
      app.state.ready.subscribe(function(isReady) {
        expect(isReady).to.be.true;
        expect(Application._plugins.length).to.equal(2);
        expect(!emptyPlugin.preloadCalled).to.be.true;
        expect(successPlugin.preloadCalled).to.be.true;
        done();
      });
    });

    it('should be able to dispatch each difficulty type event', () => {
      const app = new Application({
        hitAreaScale: true,
        dragThresholdScale: true,
        health: true,
        objectCount: true,
        completionPercentage: true,
        speedScale: true,
        timersScale: true,
        inputCount: true
      })
      const callback = Sinon.fake();

      app.state.hitAreaScale.subscribe(callback);
      app.state.dragThresholdScale.subscribe(callback);
      app.state.health.subscribe(callback);
      app.state.objectCount.subscribe(callback);
      app.state.completionPercentage.subscribe(callback);
      app.state.speedScale.subscribe(callback);
      app.state.timersScale.subscribe(callback);
      app.state.inputCount.subscribe(callback);

      app.state.hitAreaScale.value = 1;
      app.state.dragThresholdScale.value = 1;
      app.state.health.value = 1;
      app.state.objectCount.value = 1;
      app.state.completionPercentage.value = 1;
      app.state.speedScale.value = 1;
      app.state.timersScale.value = 1;
      app.state.inputCount.value = 1;

      expect(callback.callCount).to.equal(8);
    });

    it('should continue running init on plugins if a plugin has no init function', done => {
      const emptyPlugin = new EmptyPlugin();
      const successPlugin = new SuccessPlugin();

      Application.uses(emptyPlugin);
      Application.uses(successPlugin);

      const app = new Application();
      app.state.ready.subscribe(function(isReady) {
        expect(isReady).to.be.true;
        expect(Application._plugins.length).to.equal(2);
        expect(!emptyPlugin.initCalled).to.be.true;
        expect(successPlugin.initCalled).to.be.true;
        done();
      });
    });

    it('should continue running start on plugins if a plugin has no start function', done => {
      const emptyPlugin = new EmptyPlugin();
      const successPlugin = new SuccessPlugin();

      Application.uses(emptyPlugin);
      Application.uses(successPlugin);

      const app = new Application();
      app.state.ready.subscribe(function(isReady) {
        expect(isReady).to.be.true;
        expect(Application._plugins.length).to.equal(2);
        expect(!emptyPlugin.startCalled).to.be.true;
        expect(successPlugin.startCalled).to.be.true;
        done();
      });
    });
  });

  describe('getPlugin', () => {
    beforeEach(() => {
      // remove any old plugins
      Application._plugins = [];
    });

    it('should return a plugin', done => {
      const plugin = new SuccessPlugin();
      Application.uses(plugin);

      const app = new Application();
      app.state.ready.subscribe(function(isReady) {
        expect(isReady).to.be.true;

        const found = Application.getPlugin('success plugin');
        expect(found).to.be.instanceOf(SuccessPlugin);
        done();
      });
    });

    it('should return a undefined if plugin is not found', done => {
      const plugin = new SuccessPlugin();
      Application.uses(plugin);

      const app = new Application();
      app.state.ready.subscribe(function(isReady) {
        expect(isReady).to.be.true;

        const found = Application.getPlugin('not a plugin name');
        expect(found).to.be.undefined;
        done();
      });
    });

    it('should not return plugins that fail to preload', done => {
      const plugin = new FailPlugin();
      Application.uses(plugin);

      const app = new Application();
      app.state.ready.subscribe(function(isReady) {
        expect(isReady).to.be.true;

        const found = Application.getPlugin('failed plugin');
        expect(found).to.be.undefined;
        done();
      });
    });
  });

  it('should not contain any undefined state property values', done => {
    const app = new Application();
    app.state.pause.subscribe(() => {}); // Add a listener to avoid non-listener errors from the pause feature.
    app.state.ready.subscribe(isReady => {
      Object.keys(app.state).forEach(key => {
        expect(app.state[key].value).to.not.equal(undefined)
      });
      done();
    });
  });
});
