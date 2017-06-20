import {include} from '@springroll/core';

// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

var LoadQueue = include('createjs.LoadQueue');

/**
 * Represents a single item in the loader queue 
 * @class LoaderItem
 * @extends createjs.LoadQueue
 */
var LoaderItem = function()
{
    LoadQueue.call(this, true); // preferXHR is always true!

    /**
     * The number of times this load has been retried
     * @property {int} retries
     * @default
     */
    this.retries = 0;

    /**
     * The original input url of the load
     * @public
     * @property {string} url
     */
    this.url = null;

    /**
     * The actual url of the load
     * @public
     * @property {string} preparedUrl
     */
    this.preparedUrl = null;

    /**
     * Data associate with the load
     * @public
     * @property {*} data
     */
    this.data = null;

    /**
     * The callback function of the load, to call when 
     * the load as finished, takes one argument as result
     * @public
     * @property {function} onComplete
     */
    this.onComplete = null;

    /**
     * The progress callback
     * @public
     * @property {function} onProgress
     */
    this.onProgress = null;

    /**
     * The callback when a load queue item fails
     * @private
     * @property {function} _onFailed
     */
    this._onFailed = this._onFailed.bind(this);

    /**
     * The callback when a load queue item progresses
     * @private
     * @property {function} _onProgress
     */
    this._onProgress = this._onProgress.bind(this);

    /**
     * The callback when a load queue item completes
     * @private
     * @property {function} _onCompleted
     */
    this._onCompleted = this._onCompleted.bind(this);

    // Install the sound plugin if we have sound module
    var Sound = include('createjs.Sound', false);
    if (Sound)
    {
        this.installPlugin(Sound);
    }
};

LoaderItem.prototype = Object.create(LoadQueue.prototype);

/**
 * Represent this object as a string
 * @property {int} MAX_RETRIES
 * @static
 * @default 3
 */
LoaderItem.MAX_RETRIES = 3;

// @if DEBUG
/**
 * If the loads should be verbose
 * @property {Boolean} verbose
 * @static
 * @default false
 */
LoaderItem.verbose = false;
// @endif

/**
 * Represent this object as a string
 * @public
 * @method toString
 * @return {string} The string representation of this object
 */
LoaderItem.prototype.toString = function()
{
    return "[LoaderItem(url:'" + this.url + "')]";
};

/**
 * The base path of the load
 * @property {String} basePath
 * @default null
 */
Object.defineProperty(LoaderItem.prototype, 'basePath',
{
    set: function(basePath)
    {
        this._basePath = basePath;
    }
});

/**
 * If this load should be cross origin
 * @property {Boolean} crossOrigin
 * @default false
 */
Object.defineProperty(LoaderItem.prototype, 'crossOrigin',
{
    set: function(crossOrigin)
    {
        this._crossOrigin = crossOrigin;
    }
});

/**
 * Clear all the data
 * @method clear
 */
LoaderItem.prototype.clear = function()
{
    this.basePath = "";
    this.crossOrigin = false;
    this.retries = 0;
    this.onComplete = null;
    this.onProgress = null;
    this.data = null;
    this.preparedUrl = null;
    this.url = null;

    this.removeAllEventListeners();
    this.removeAll();
    this.close();
};

/**
 * Start the loading
 * @method  start
 * @param {int} maxCurrentLoads The max number of simultaneous load
 */
LoaderItem.prototype.start = function(maxCurrentLoads)
{
    // @if DEBUG
    if (LoaderItem.verbose)
    {
        Debug.log("Attempting to load file '" + this.url + "'");
    }
    // @endif
    this.addEventListener('fileload', this._onCompleted);
    this.addEventListener('error', this._onFailed);
    this.addEventListener('fileprogress', this._onProgress);
    this._internalStart();
};

/**
 * Start the loading internally
 * @method  _internalStart
 * @private
 */
LoaderItem.prototype._internalStart = function()
{
    var url = this.preparedUrl;

    // Special loading for the Sound, requires the ID
    if (this.data && this.data.id)
    {
        url = {
            id: this.data.id,
            src: url,
            data: this.data
        };
    }

    // Load the file
    this.loadFile(url);
};

/**
 * The file load progress event
 * @method _onProgress
 * @private
 * @param {object} event The progress event
 */
LoaderItem.prototype._onProgress = function(event)
{
    if (this.onProgress)
    {
        this.onProgress(this.progress);
    }
};

/**
 * There was an error loading the file
 * @private
 * @method _onFailed
 */
LoaderItem.prototype._onFailed = function(event)
{
    // @if DEBUG
    Debug.error("Unable to load file: " + this.url + " - reason: " + event.error);
    // @endif
    // TODO: This requires a bit more looking into, this solves a memory leak with event listeners piling up.
    this.removeAll();
    this.retry();
};

/**
 * Retry the current load
 * @method  retry
 */
LoaderItem.prototype.retry = function()
{
    this.retries++;
    if (this.retries > LoaderItem.MAX_RETRIES)
    {
        this.onComplete(this, null);
    }
    else
    {
        this._internalStart();
    }
};

/**
 * The file was loaded successfully
 * @private
 * @method _onCompleted
 * @param {object} ev The load event
 */
LoaderItem.prototype._onCompleted = function(ev)
{
    // @if DEBUG
    if (LoaderItem.verbose)
    {
        Debug.log("File loaded successfully from " + this.url);
    }
    // @endif
    this.onComplete(this, ev.result);
};

export default LoaderItem;
