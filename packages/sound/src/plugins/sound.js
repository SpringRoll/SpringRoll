import {ApplicationPlugin, include} from '@springroll/core';
import Sound from '../Sound';
import VOPlayer from '../VOPlayer';
import SoundTask from '../SoundTask';

(function() {

    const plugin = new ApplicationPlugin('sound');

    //Initialize
    plugin.setup = function() {
        //Include classes
        const WebAudioPlugin = include('createjs.WebAudioPlugin');
        const FlashAudioPlugin = include('createjs.FlashAudioPlugin', false);

        const options = this.options;

        /**
         * The preferred order of SoundJS audio plugins to use.
         * ### module: @springroll/sound
         * @member {Array} audioPlugins
         * @memberof springroll.ApplicationOptions#
         * @default [WebAudioPlugin, FlashAudioPlugin]
         * @readOnly
         */
        options.add('audioPlugins', FlashAudioPlugin ? [WebAudioPlugin, FlashAudioPlugin] : [WebAudioPlugin], true);

        /**
         * The relative location to the FlashPlugin swf for SoundJS.
         * ### module: @springroll/sound
         * @member {String} swfPath
         * @memberof springroll.ApplicationOptions#
         * @default 'assets/swfs/'
         * @readOnly
         */
        options.add('swfPath', 'assets/swfs/', true);

        /**
         * For the Sound class to use the Flash plugin shim.
         * ### module: @springroll/sound
         * @member {Boolean} forceFlashAudio
         * @memberof springroll.ApplicationOptions#
         * @default false
         * @readOnly
         */
        options.add('forceFlashAudio', false, true);

        /**
         * For the Sound class to use Native Audio Plugin if Cordova is detected. Only applicable to games that require native audio.
         * If set to true, use Native Audio in Cordova if the plugin is available.
         * If set to false, then Sound will fall back to the standard plugins as set either by plugin options or in sound class.
         * ### module: @springroll/sound
         * @member {Boolean} forceNativeAudio
         * @memberof springroll.ApplicationOptions#
         * @default false
         * @readOnly
         */
        options.add('forceNativeAudio', false, true);

        /**
         * The order in which file types are
         * preferred, where "ogg" becomes a ".ogg"
         * extension on all sound file urls.
         * ### module: @springroll/sound
         * @member {Array} audioTypes
         * @memberof springroll.ApplicationOptions#
         * @default ['ogg','mp3']
         * @readOnly
         */
        options.add('audioTypes', ['ogg', 'mp3'], true);

        // @if DEBUG
        /**
         * Set the initial mute state of the all the audio
         * (unminifed library version only)
         * ### module: @springroll/sound
         * @member {Boolean} mute
         * @memberof springroll.ApplicationOptions#
         * @default false
         * @readOnly
         */
        options.add('mute', false, true);
        // @endif

        /**
         * The current music alias playing
         * ### module: @springroll/sound
         * @member {String} _music
         * @memberof springroll.Application#
         * @private
         */
        this._music = null;

        /**
         * The current music SoundInstance playing
         * ### module: @springroll/sound
         * @member {SoundInstance} _musicInstance
         * @memberof springroll.Application#
         * @private
         */
        this._musicInstance = null;

        /**
         * The global player for playing voice over
         * ### module: @springroll/sound
         * @member {springroll.VOPlayer} voPlayer
         * @memberof springroll.Application#
         */
        this.voPlayer = new VOPlayer();

        /**
         * The global player for all audio, also accessible through singleton
         * ### module: @springroll/sound
         * @member {springroll.Sound} sound
         * @memberof springroll.Application#
         */
        this.sound = null;

        //Add new task
        this.assetManager.register(SoundTask);

        /**
         * Get or set the current music alias to play
         * ### module: @springroll/sound
         * @member {String} music
         * @memberof springroll.Application#
         * @default null
         */
        Object.defineProperty(this, 'music',
            {
                set(value) {
                    if (value === this._music) {
                        return;
                    }
                    let sound = this.sound;

                    if (this._music) {
                        sound.fadeOut(this._music);
                        this._musicInstance = null;
                    }
                    this._music = value;

                    if (value) {
                        this._musicInstance = sound.play(
                            this._music,
                            {
                                start: sound.fadeIn.bind(sound, value),
                                loop: -1
                            }
                        );
                    }
                },
                get() {
                    return this._music;
                }
            });

        /**
         * The SoundInstance for the current music, for adjusting volume.
         * ### module: @springroll/sound
         * @member {springroll.SoundInstance} musicInstance
         * @memberof springroll.Application#
         */
        Object.defineProperty(this, 'musicInstance',
            {
                get() {
                    return this._musicInstance;
                }
            });

        //Add the listener for the config loader to autoload the sounds
        this.once('configLoaded', function(config) {
            //initialize Sound and load up global sound config
            let sounds = config.sounds;
            let sound = this.sound;

            if (sounds) {
                if (sounds.vo) {
                    sound.addContext(sounds.vo);
                }
                if (sounds.sfx) {
                    sound.addContext(sounds.sfx);
                }
                if (sounds.music) {
                    sound.addContext(sounds.music);
                }
            }
        });
    };

    /**
     * The sound is ready to use
     * ### module: @springroll/sound
     * @event springroll.Application#soundReady
     */
    let SOUND_READY = 'soundReady';

    //Start the initialization of the sound
    plugin.preload = function(done) {
        Sound.init(
            {
                plugins: this.options.audioPlugins,
                swfPath: this.options.swfPath,
                types: this.options.audioTypes,
                ready: () => {
                
                    if (this.destroyed) {
                        return;
                    }

                    let sound = this.sound = Sound.instance;

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
    plugin.teardown = function() {
        if (this.voPlayer) {
            this.voPlayer.destroy();
            this.voPlayer = null;
        }
        if (this.sound) {
            this.sound.destroy();
            this.sound = null;
        }
    };

}());