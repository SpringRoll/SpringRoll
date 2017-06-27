import {ApplicationPlugin, include} from '@springroll/core';
import Sound from '../Sound';
import VOPlayer from '../VOPlayer';
import SoundTask from '../SoundTask';

(function()
{
    /**
     * @class Application
     */
    const plugin = new ApplicationPlugin('sound');

    //Initialize
    plugin.setup = function()
    {
        //Include classes
        const WebAudioPlugin = include('createjs.WebAudioPlugin');
        const FlashAudioPlugin = include('createjs.FlashAudioPlugin', false);

        /**
         * The preferred order of SoundJS audio plugins to use.
         * @property {Array} options.audioPlugins
         * @default [WebAudioPlugin,FlashAudioPlugin]
         * @readOnly
         */
        this.options.add('audioPlugins', FlashAudioPlugin ? [WebAudioPlugin, FlashAudioPlugin] : [WebAudioPlugin], true);

        /**
         * The relative location to the FlashPlugin swf for SoundJS
         * @property {String} options.swfPath
         * @default 'assets/swfs/'
         * @readOnly
         */
        this.options.add('swfPath', 'assets/swfs/', true);

        /**
         * For the Sound class to use the Flash plugin shim
         * @property {Boolean} options.forceFlashAudio
         * @default false
         * @readOnly
         */
        this.options.add('forceFlashAudio', false, true);

        /**
         * For the Sound class to use Native Audio Plugin if Cordova is detected. Only applicable to games that require native audio.
         * If set to true, use Native Audio in Cordova if the plugin is available.
         * If set to false, then Sound will fall back to the standard plugins as set either by plugin options or in sound class.
         * @property {Boolean} options.forceNativeAudio
         * @default false
         * @readOnly
         */
        this.options.add('forceNativeAudio', false, true);

        /**
         * The order in which file types are
         * preferred, where "ogg" becomes a ".ogg"
         * extension on all sound file urls.
         * @property {Array} options.audioTypes
         * @default ['ogg','mp3']
         * @readOnly
         */
        this.options.add('audioTypes', ['ogg', 'mp3'], true);

        // @if DEBUG
        /**
         * Set the initial mute state of the all the audio
         * (unminifed library version only)
         * @property {Boolean} options.mute
         * @default false
         * @readOnly
         */
        this.options.add('mute', false, true);
        // @endif

        /**
         * The current music alias playing
         * @property {String} _music
         * @private
         */
        this._music = null;

        /**
         * The current music SoundInstance playing
         * @property {SoundInstance} _musicInstance
         * @private
         */
        this._musicInstance = null;

        /**
         * The global player for playing voice over
         * @property {springroll.VOPlayer} voPlayer
         */
        this.voPlayer = new VOPlayer();

        /**
         * The global player for all audio, also accessible through singleton
         * @property {springroll.Sound} sound
         */
        this.sound = null;

        //Add new task
        this.assetManager.register(SoundTask);

        /**
         * Get or set the current music alias to play
         * @property {String} music
         * @default null
         */
        Object.defineProperty(this, 'music',
            {
                set(value)
                {
                    if (value === this._music)
                    {
                        return;
                    }
                    var sound = this.sound;

                    if (this._music)
                    {
                        sound.fadeOut(this._music);
                        this._musicInstance = null;
                    }
                    this._music = value;

                    if (value)
                    {
                        this._musicInstance = sound.play(
                            this._music,
                            {
                                start: sound.fadeIn.bind(sound, value),
                                loop: -1
                            }
                        );
                    }
                },
                get()
                {
                    return this._music;
                }
            });

        /**
         * The SoundInstance for the current music, for adjusting volume.
         * @property {SoundInstance} musicInstance
         */
        Object.defineProperty(this, 'musicInstance',
            {
                get()
                {
                    return this._musicInstance;
                }
            });

        //Add the listener for the config loader to autoload the sounds
        this.once('configLoaded', function(config)
        {
            //initialize Sound and load up global sound config
            var sounds = config.sounds;
            var sound = this.sound;

            if (sounds)
            {
                if (sounds.vo)
                {
                    sound.addContext(sounds.vo);
                }
                if (sounds.sfx)
                {
                    sound.addContext(sounds.sfx);
                }
                if (sounds.music)
                {
                    sound.addContext(sounds.music);
                }
            }
        });
    };

    /**
     * The sound is ready to use
     * @event soundReady
     */
    var SOUND_READY = 'soundReady';

    //Start the initialization of the sound
    plugin.preload = function(done)
    {
        Sound.init(
            {
                plugins: this.options.audioPlugins,
                swfPath: this.options.swfPath,
                types: this.options.audioTypes,
                ready: () => 
                {
                
                    if (this.destroyed) 
                    {
                        return;
                    }

                    var sound = this.sound = Sound.instance;

                    // @if DEBUG
                    //For testing, mute the game if requested
                    sound.muteAll = !!this.options.mute;
                    // @endif
                    
                    //Add listeners to pause and resume the sounds
                    this.on('paused', () => sound.pauseAll());
                    this.on('resumed', () => sound.resumeAll());
                    this.emit(SOUND_READY);
                    done();
                }
            });
    };

    //Destroy the animator
    plugin.teardown = function()
    {
        if (this.voPlayer)
        {
            this.voPlayer.destroy();
            this.voPlayer = null;
        }
        if (this.sound)
        {
            this.sound.destroy();
            this.sound = null;
        }
    };

}());