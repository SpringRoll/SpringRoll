import { Debugger } from './debug/Debugger.js';
import { HintSequencePlayer } from './hints/HintSequencePlayer.js';
import { Property } from './state/Property.js';
import { BellhopSingleton } from './communication/BellhopSingleton';

const pause = 'pause';
const captionsMuted = 'captionsMuted';
const soundVolume = 'soundVolume';
const musicVolume = 'musicVolume';
const voVolume = 'voVolume';
const sfxVolume = 'sfxVolume';
const playHelp = 'playHelp';

/**
 * Main entry point for a game. Provides a single focal point for plugins and functionality to attach.
 * @class Application
 */
export class Application {
  /**
   * @param {Object} [config={}]  Root configuration object for various internal Application objects
   * @param {Object} [config.hintPlayer = HintSequencePlayer] IHintPlayer application will use.
   * @param {Object} [config.features={}] A configuration object denoting which features are enabled for this application
   * @param {Boolean} [config.features.captions] A boolean value denoting that this game supports captions
   * @param {Boolean} [config.features.sound] A boolean value denoting that this game has some audio in it
   * @param {Boolean} [config.features.vo] A boolean denoting that this game has mutable voice-over audio in it
   * @param {Boolean} [config.features.music] A boolean denoting that this game has mutable music in it
   * @param {Boolean} [config.features.sfx] A boolean denoting that this game has mutable sound effects in it
   * @param {Boolean} [config.features.soundVolume] A boolean denoting that this game has adjustable sound volume in it
   * @param {Boolean} [config.features.musicVolume] A boolean denoting that this game has adjustable music volume in it
   * @param {Boolean} [config.features.voVolume] A boolean denoting that this game has adjustable voice-over volume in it
   * @param {Boolean} [config.features.sfxVolume] A boolean denoting that this game has adjustable sound effects volume in it
   */
  constructor({ features, hintPlayer = new HintSequencePlayer() } = {}) {
    this.state = {
      ready: new Property(false),
      pause: new Property(false),
      captionsMuted: new Property(true),
      playOptions: new Property({}),
      soundVolume: new Property(1),
      musicVolume: new Property(1),
      voVolume: new Property(1),
      sfxVolume: new Property(1)
    };

    this.features = Object.assign(
      {
        captions: false,
        sound: false,
        vo: false,
        music: false,
        sfx: false,
        soundVolume: false,
        musicVolume: false,
        voVolume: false,
        sfxVolume: false
      },
      features || {}
    );

    // always enable sound if one of the sound channels is enabled
    if (this.features.vo || this.features.music || this.features.sfx) {
      this.features.sound = true;
    }

    // create the connection to the container (if possible), and report features and SpringRoll 1 compat data
    this.container = BellhopSingleton;
    this.container.connect();
    this.container.send('features', this.features);
    this.container.send('keepFocus', false);

    // listen for events from the container and keep the local value in sync
    [
      soundVolume,
      musicVolume,
      voVolume,
      sfxVolume,
      captionsMuted,
      pause
    ].forEach(eventName => {
      const property = this.state[eventName];
      this.container.on(
        eventName,
        containerEvent => (property.value = containerEvent.data)
      );
    });

    // listen for legacy mute events from the container and map them to volume properties
    [
      { mute: 'soundMuted', volume: soundVolume },
      { mute: 'musicMuted', volume: musicVolume },
      { mute: 'voMuted', volume: voVolume },
      { mute: 'sfxMuted', volume: sfxVolume }
    ].forEach(pair => {
      const property = this.state[pair.volume];
      this.container.on(pair.mute, containerEvent => {
        const previousValue = property._previousValue || 1;
        property._previousValue = property.value;
        property.value = containerEvent.data ? 0 : previousValue;
      });
    });

    // maintain focus sync between the container and application
    window.addEventListener('focus', () => this.container.send('focus', true));
    window.addEventListener('blur', () => this.container.send('focus', false));

    // attempt to fetch play options from the query string (passed by the Container)
    const match = /playOptions=[^&$]*/.exec(window.location.search);
    if (match !== null) {
      const matchedToken = match[0];
      const rawValue = decodeURIComponent(matchedToken.split('=')[1]);

      try {
        this.state.playOptions.value = JSON.parse(rawValue);
      } catch (e) {
        Debugger.log(
          'warn',
          'Failed to parse playOptions from query string:' + e.message
        );
      }
    }

    // Also attempt to fetch over the iframe barrier for old container support
    this.container.fetch(
      'playOptions',
      e => (this.state.playOptions.value = e.data)
    );

    this.setupPlugins()
      .catch(e => {
        Debugger.log('warn', e);
      })
      .then(() => {
        this.validateListeners();
      })
      .catch(e => {
        Debugger.log('warn', e);
      })
      .then(() => {
        this.container.send('loaded');
        this.state.ready.value = true;
      });

    //register bellhop event for hints.
    this.hints = hintPlayer;
    this.container.on(playHelp, () => {
      if (!this.hints) {
        Debugger.log(
          'warn',
          '[Springroll] Missing IHintPlayer see: https://github.com/SpringRoll/SpringRoll/tree/v2/src/hints'
        ); // <-- this could only happen if devs set this.hints manually.
        return;
      }

      this.hints.play();
    });
  }

  /**
   * preloads, initializes and starts plugins.
   * @return {void}
   * @memberof Application
   */
  setupPlugins() {
    const preloads = [];
    Application._plugins.forEach(plugin => {
      if (!plugin.preload) {
        return;
      }

      preloads.push(
        plugin.preload(this).catch(function preloadFail(error) {
          plugin.preloadFailed = true;
          console.warn(plugin.name, 'Preload Failed:', error);
        })
      );
    });

    // ~wait for all preloads to resolve
    return Promise.all(preloads).then(() => {
      // Remove plugins that fail to load.
      Application._plugins = Application._plugins.filter(
        plugin => plugin.preloadFailed !== true
      );

      //init
      Application._plugins.forEach(plugin => {
        if (!plugin.init) {
          return;
        }

        plugin.init(this);
      });

      //start
      Application._plugins.forEach(plugin => {
        if (!plugin.start) {
          return;
        }

        plugin.start(this);
      });
    });
  }

  /**
   * Validates that appropriate listeners are added for the features that were enabled in the constructor
   * @throws Error
   */
  validateListeners() {
    const missingListeners = [];

    const featureToStateMap = {
      captions: captionsMuted,
      sound: soundVolume,
      music: musicVolume,
      vo: voVolume,
      sfx: sfxVolume
    };

    Object.keys(featureToStateMap).forEach(feature => {
      const stateName = featureToStateMap[feature];

      if (this.features[feature] && !this.state[stateName].hasListeners) {
        missingListeners.push(stateName);
      }
    });

    if (!this.state.pause.hasListeners) {
      missingListeners.push('pause');
    }

    if (missingListeners.length) {
      throw new Error(
        'Application state is missing required listeners: ' +
          missingListeners.join(', ') +
          '.'
      );
    }
  }
}

/**
 * The list of plugins that are currently registered to run on Applications.
 * @static
 */
Application._plugins = [];

/**
 * Registers a plugin to be used by applications, sorting it by priority order.
 * @param {SpringRoll.ApplicationPlugin} plugin The plugin to register.
 */
Application.uses = function(plugin) {
  Application._plugins.push(plugin);
};

/**
 * Finds a plugin by name.
 * @param {string} name The name of the plugin.
 */
Application.getPlugin = function(name) {
  return Application._plugins.find(function(plugin) {
    return plugin.name === name;
  });
};
