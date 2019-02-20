import { Application, ApplicationPlugin } from './index';

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

  it('should continue loading other plugins if another plugin\'s preload fails', done =>{
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

  it('should not call init on a plugin that has failed it\'s preload', done =>{
    const plugin = new FailPlugin();
    Application.uses(plugin);

    const app = new Application();
    app.state.ready.subscribe(function(isReady) {
      expect(isReady).to.be.true;
      expect(!plugin.initCalled).to.be.true;
      done();
    });
  });

  it('should not call start on a plugin that has failed it\'s preload', done =>{
    const plugin = new FailPlugin();
    Application.uses(plugin);

    const app = new Application();
    app.state.ready.subscribe(function(isReady) {
      expect(isReady).to.be.true;
      expect(!plugin.startCalled).to.be.true;
      done();
    });
  });

});
