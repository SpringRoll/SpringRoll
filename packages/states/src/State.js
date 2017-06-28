import {Application, EventEmitter} from '@springroll/core';
// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

/**
 * Defines the base functionality for a state used by the state manager.
 * ### module: @springroll/states
 *
 * @class
 * @memberof springroll
 * @extends springroll.EventEmitter
 */
export default class State extends EventEmitter {
/**
 * @param {createjs.Container|PIXI.DisplayObjectContainer} panel The panel to associate with
 *     this state.
 * @param {Object} [options] The list of options
 * @param {String|Function} [options.next=null] The next state alias or function to call when going to the next state.
 * @param {String|Function} [options.previous=null] The previous state alias to call when going to the previous state.
 * @param {int} [options.delayLoad=0] The number of frames to delay the loading for cases where
 *  heavy object instaniation slow the game dramatically.
 * @param {Array} [options.preload=[]] The assets to preload before the state loads
 * @param {Object|String} [options.scaling=null] The scaling items to use with the ScaleManager.
 *       If options.scaling is `"panel"` then the entire panel will be scaled as a title-safe
 *       item. See `ScaleManager.addItems` for more information about the
 *       format of the scaling objects. (UI Module only)
 */

    constructor(panel, options) {
        super();

        // @if DEBUG
        if (!panel) {
            Debug.error('State requires a panel display object as the first constructor argument');
        }
        // @endif

        // Construct the options
        options = Object.assign(
            {
                next: null,
                previous: null,
                delayLoad: 0,
                preload: [],
                scaling: null
            }, options ||
        {});

        /**
         * Reference to the main app
         * @member {Application}
         * @readOnly
         */
        let app = this.app = Application.instance;

        /**
         * The instance of the VOPlayer, Sound module required
         * @member {springroll.VOPlayer}
         * @readOnly
         */
        this.voPlayer = app.voPlayer || null;

        /**
         * The instance of the Sound, Sound module required
         * @member {springroll.Sound}
         * @readOnly
         */
        this.sound = app.sound || null;

        /**
         * Reference to the main config object
         * @member {Object}
         * @readOnly
         */
        this.config = app.config || null;

        /**
         * Reference to the scaling object, UI module required
         * @member {springroll.ScaleManager}
         * @readOnly
         */
        this.scaling = app.scaling || null;

        /**
         * The items to scale on the panel, see `ScaleManager.addItems` for
         * more information. If no options are set in the State's constructor
         * then it will try to find an object on the app config on `scaling` property
         * matching the same state alias. For instance `config.scaling.title` if
         * `title` is the state alias. If no scalingItems are set, will scale
         * and position the panal itself.
         * @member {Object}
         * @readOnly
         * @default null
         */
        this.scalingItems = options.scaling || null;

        /**
         * The id reference
         * @member {String}
         */
        this.stateId = null;

        /**
         * A reference to the state manager
         * @member {springroll.StateManager}
         */
        this.manager = null;

        /**
         * The panel for the state.
         * @member {createjs.Container|PIXI.DisplayObjectContainer}
         */
        this.panel = panel;

        /**
         * The assets to load each time
         * @member {Array}
         */
        this.preload = options.preload;

        /**
         * Check to see if the assets have finished loading
         * @member {Boolean}
         * @protected
         * @readOnly
         */
        this.preloaded = false;

        /**
         * The collection of assets loaded
         * @member {Array|Object}
         * @protected
         */
        this.assets = null;

        /**
         * If the state has been destroyed.
         * @member {Boolean}
         * @private
         */
        this._destroyed = false;

        /**
         * If the manager considers this the active panel
         * @member {Boolean}
         * @private
         */
        this._active = false;

        /**
         * If we are pre-loading the state
         * @member {Boolean}
         * @private
         */
        this._isLoading = false;

        /**
         * If we canceled entering the state
         * @member {Boolean}
         * @private
         */
        this._canceled = false;

        /**
         * When we're finishing loading
         * @member {Function}
         * @private
         */
        this._onEnterProceed = null;

        /**
         * If we start doing a load in enter, assign the onEnterComplete here
         * @member {Function}
         * @private
         */
        this._onLoadingComplete = null;

        /**
         * If the state is enabled, meaning that it is click ready
         * @member {Boolean}
         * @private
         */
        this._enabled = false;

        /**
         * Either the alias of the next state or a function
         * to call when going to the next state.
         * @member {String|Function}
         * @private
         */
        this._nextState = options.next;

        /**
         * Either the alias of the previous state or a function
         * to call when going to the previous state.
         * @member {String|Function}
         * @private
         */
        this._prevState = options.previous;

        /**
         * The number of frames to delay the transition in after loading, to allow the framerate
         * to stablize after heavy art instantiation.
         * @member {int}
         * @protected
         */
        this.delayLoad = options.delayLoad;

        // Hide the panel by default
        this.panel.visible = false;

        // create empty function to avoid a lot of if checks
        function empty() {}

        /**
         * When the state is exited. Override this to provide state cleanup.
         * @member {function}
         * @default null
         */
        this.exit = empty;

        /**
         * When the state has requested to be exit, pre-transition. Override this to ensure
         * that animation/audio is stopped when leaving the state.
         * @member {function}
         * @default null
         */
        this.exitStart = empty;

        /**
         * Cancel the load, implementation-specific.
         * This is where any async actions should be removed.
         * @member {function}
         * @default null
         */
        this.cancel = empty;

        /**
         * When the state is entered. Override this to start loading assets - call loadingStart()
         * to tell the StateManager that that is going on.
         * @member {function}
         * @default null
         */
        this.enter = empty;

        /**
         * When the state is visually entered fully - after the transition is done.
         * Override this to begin your state's activities.
         * @member {function}
         * @default null
         */
        this.enterDone = empty;
    }

    /**
     * Event when the state finishes exiting. Nothing is showing at this point.
     * @event springroll.State#exit
     */

    /**
     * Event when the state is being destroyed.
     * @event springroll.State#destroy
     */

    /**
     * Event when the transition is finished the state is fully entered.
     * @event springroll.State#enterDone
     */

    /**
     * Event when the loading of a state was canceled.
     * @event springroll.State#cancel
     */

    /**
     * Event when the state starts exiting, everything is showing at this point.
     * @event springroll.State#exitStart
     */

    /**
     * Event when the preload of assets is finished. If no assets are loaded, the `assets` parameter is null.
     * @event springroll.State#loaded
     * @param {Object|Array|null} asset The collection of assets loaded
     */

    /**
     * When there has been a change in how much has been preloaded
     * @event springroll.State#progress
     * @param {Number} percentage The amount preloaded from zero to 1
     */

    /**
     * Event when the assets are starting to load.
     * @event springroll.State#loading
     * @param {Array} asset An empty array that additional assets can be added to, if needed. Any dynamic
     *                      assets that are added need to be manually unloaded when the state exits.
     */

    /**
     * Event when the state is enabled status changes. Enable is when the state is mouse enabled or not.
     * @event springroll.State#enabled
     * @param {Boolean} enable The enabled status of the state
     */

    /**
     * Goto the next state
     * @final
     */
    nextState() {
        let type = typeof this._nextState;

        if (!this._nextState) {
            // @if DEBUG
            Debug.info('\'next\' is undefined in current state, ignoring');
            // @endif
            return;
        }
        else if (type === 'function') {
            this._nextState();
        }
        else if (type === 'string') {
            this.manager.state = this._nextState;
        }
    }

    /**
     * Goto the previous state
     * @final
     */
    previousState() {
        let type = typeof this._prevState;

        if (!this._prevState) {
            // @if DEBUG
            Debug.info('\'prevState\' is undefined in current state, ignoring');
            // @endif
            return;
        }
        else if (type === 'function') {
            this._prevState();
        }
        else if (type === 'string') {
            this.manager.state = this._prevState;
        }
    }

    /**
     * Manual call to signal the start of preloading
     * @final
     */
    loadingStart() {
        if (this._isLoading) {
            // @if DEBUG
            Debug.warn('loadingStart() was called while we\'re already loading');
            // @endif
            return;
        }

        this._isLoading = true;
        this.manager.loadingStart();

        // Starting a load is optional and
        // need to be called from the enter function
        // We'll override the existing behavior
        // of internalEnter, by passing
        // the complete function to onLoadingComplete
        this._onLoadingComplete = this._onEnterProceed;
        this._onEnterProceed = null;
    }

    /**
     * Manual call to signal the end of preloading
     * @final
     * @param {int} [delay] Frames to delay the load completion to allow the framerate to
     *   stabilize. If not delay is set, defaults to the `delayLoad` property.
     */
    loadingDone(delay) {
        if (delay === undefined) {
            delay = this.delayLoad;
        }

        if (!this._isLoading) {
            // @if DEBUG
            Debug.warn('loadingDone() was called without a load started, call loadingStart() first');
            // @endif
            return;
        }

        if (delay && typeof delay === 'number') {
            //allow the renderer to figure out that any images on stage need decoding during the
            //delay, not during the transition in
            this.panel.visible = true;
            this.app.setTimeout(this.loadingDone.bind(this, 0), delay, true);
            return;
        }

        this._isLoading = false;
        this.manager.loadingDone();

        if (this._onLoadingComplete) {
            this._onLoadingComplete();
            this._onLoadingComplete = null;
        }
    }

    /**
     * Status of whether the panel load was canceled
     * @member {Boolean}
     * @readOnly
     */
    get canceled() {
        return this._canceled;
    }

    /**
     * Get if this is the active state
     * @member {Boolean}
     * @readOnly
     */
    get active() {
        return this._active;
    }

    /**
     * If the state is enabled, meaning that it is click ready
     * @member {Boolean}
     */
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        let oldEnabled = this._enabled;
        this._enabled = value;
        if (oldEnabled !== value) {
            this.emit('enabled', value);
        }
    }

    /**
     * If the state has been destroyed.
     * @member {Boolean}
     * @readOnly
     */
    get destroyed() {
        return this._destroyed;
    }

    /**
     * This is called by the State Manager to exit the state
     * @private
     */
    _internalExit() {
        this.preloaded = false;

        // local variables
        let panel = this.panel;
        let items = this.scalingItems;
        let scaling = this.scaling;

        //remove scaling objects that we added
        if (scaling && items) {
            if (items === 'panel') {
                scaling.removeItem(panel);
            }
            else {
                scaling.removeItems(panel, items);
            }
        }

        // Clean any assets loaded by the manifest
        if (this.preload.length) {
            this.app.unload(this.preload);
        }

        if (this._isTransitioning) {
            this._isTransitioning = false;
            if (this.manager.animator) {
                this.manager.animator.stop(panel);
            }
        }
        this._enabled = false;
        panel.visible = false;
        this._active = false;
        this.exit();

        this.emit('exit');
    }

    /**
     * When the state is entering
     * @param {Function} proceed The function to call after enter has been called
     * @private
     */
    _internalEntering() {
        this.enter();

        this.emit('enter');

        // Start prealoading assets
        this.loadingStart();

        // Boolean to see if we've preloaded assests
        this.preloaded = false;

        let assets = [];

        this.emit('loading', assets);

        if (this.preload.length) {
            assets = this.preload.concat(assets);
        }

        // Start loading assets if we have some
        if (assets.length) {
            this.app.load(assets,
                {
                    complete: this._onLoaded.bind(this),
                    progress: this._onProgress.bind(this),
                    cacheAll: true
                });
        }
        // No files to load, just continue
        else {
            this._onLoaded(null);
        }
    }

    /**
     * Handle the load progress and pass to the manager
     * @private
     * @param {Number} progress The amount preloaded from zero to 1
     */
    _onProgress(progress) {
        this.emit('progress', progress);
        this.manager.emit('progress', progress);
    }

    /**
     * The internal call for on assets loaded
     * @private
     * @param {Object|null} assets The assets result of the load
     */
    _onLoaded(assets) {
        this.assets = assets;
        this.preloaded = true;

        this.emit('loaded', assets);

        if (this.scaling) {
            let items = this.scalingItems;

            if (items) {
                if (items === 'panel') {
                    // Reset the panel scale & position, to ensure
                    // that the panel is scaled properly
                    // upon state re-entry
                    this.panel.x = this.panel.y = 0;
                    this.panel.scaleX = this.panel.scaleY = 1;

                    this.scaling.addItem(this.panel,
                        {
                            align: 'top-left',
                            titleSafe: true
                        });
                }
                else {
                    this.scaling.addItems(this.panel, items);
                }
            }
        }
        this.loadingDone();
    }

    /**
     * Exit the state start, called by the State Manager
     * @private
     */
    _internalExitStart() {
        this.exitStart();
        this.emit('exitStart');
    }

    /**
     * Exit the state start, called by the State Manager
     * @param {Function} proceed The function to call after enter has been called
     * @private
     */
    _internalEnter(proceed) {
        if (this._isTransitioning) {
            this._isTransitioning = false;
            if (this.manager.animator) {
                this.manager.animator.stop(this.panel);
            }
        }
        this._enabled = false;
        this._active = true;
        this._canceled = false;

        this._onEnterProceed = proceed;
        this._internalEntering();

        if (this._onEnterProceed) {
            this._onEnterProceed();
            this._onEnterProceed = null;
        }
    }

    /**
     * Cancel the loading of this state
     * @private
     */
    _internalCancel() {
        this._active = false;
        this._canceled = true;
        this._isLoading = false;

        this._internalExit();
        this.cancel();
        this.emit('cancel');
    }

    /**
     * Exit the state start, called by the State Manager
     * @private
     */
    _internalEnterDone() {
        if (this._canceled) {
            return;
        }

        this.enabled = true;
        this.enterDone();
        this.emit('enterDone');
    }

    /**
     * Don't use the state object after this
     */
    destroy() {
        // Only destroy once!
        if (this._destroyed) {
            return;
        }

        this.emit('destroy');

        this.app = null;
        this.scaling = null;
        this.sound = null;
        this.voPlayer = null;
        this.config = null;
        this.scalingItems = null;
        this.assets = null;
        this.preload = null;
        this.panel = null;
        this.manager = null;
        this._destroyed = true;
        this._onEnterProceed = null;
        this._onLoadingComplete = null;

        super.destroy();
    }
}
