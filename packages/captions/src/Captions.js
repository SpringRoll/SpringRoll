import {Application} from '@springroll/core';
// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

/**
 * A class that creates captioning for multimedia content. Captions are
 * created from a dictionary of captions and can be played by alias.
 * @example
    var captionsData = {
        "Alias1": [
            {"start":0, "end":2000, "content":"Ohh that looks awesome!"}
        ],
        "Alias2": [
            {"start":0, "end":2000, "content":"Love it, absolutely love it!"}
        ]
    };

    //initialize the captions
    var captions = new springroll.Captions();
    captions.data = captionsData;
    captions.textField = document.getElementById("captions");
    captions.play("Alias1");
 * @class Captions
 * @constructor
 * @param {Object} [data=null] The captions dictionary
 * @param {String|DOMElement} [textField=null] The output text field
 * @param {Boolean} [selfUpdate=true] If the captions playback should update itself
 */
export default class Captions
{
    constructor(data, textField, selfUpdate)
    {
        /**
         * An object used as a dictionary with keys that should be the same as sound aliases
         * @private
         * @property {Object} _data
         */
        this._data = null;

        /**
         * A reference to the Text object that Captions should be controlling.
         * Only one text field can be controlled at a time.
         * @private
         * @property {createjs.Text|PIXI.Text|PIXI.BitmapText|DOMElement} _textField
         */
        this._textField = null;

        /**
         * The function to call when playback is complete.
         * @private
         * @property {Function} _completeCallback
         */
        this._completeCallback = null;

        /**
         * The collection of line objects - {start:0, end:0, content:""}
         * @private
         * @property {Array} _lines
         */
        this._lines = [];

        /**
         * The alias of the current caption.
         * @private
         * @property {String} _currentAlias
         */
        this._currentAlias = 0;

        /**
         * The duration in milliseconds of the current caption.
         * @private
         * @property {int} _currentDuration
         */
        this._currentDuration = 0;

        /**
         * The current playback time, in milliseconds.
         * @private
         * @property {int} _currentTime
         */
        this._currentTime = 0;

        /**
         * The current line index.
         * @private
         * @property {int} _currentLine
         */
        this._currentLine = -1;

        /**
         * The last active line index.
         * @private
         * @property {int} _lastActiveLine
         */
        this._lastActiveLine = -1;

        /**
         * If we're playing.
         * @private
         * @property {Boolean} _playing
         */
        this._playing = false;

        /**
         * If this instance has been destroyed already.
         * @private
         * @property {Boolean} _destroyed
         */
        this._destroyed = false;

        /**
         * If the captions object should do its own update.
         * @property {Boolean} _selfUpdate
         * @private
         * @default true
         */
        this._selfUpdate = true;

        /**
         * If the captions are muted
         * @property {Boolean} _mute
         * @private
         * @default false
         */
        this._mute = false;

        //Bind the update function
        this.update = this.update.bind(this);

        //Set with preset
        this.data = data || {};
        this.textField = textField || null;
        this.selfUpdate = selfUpdate === undefined ? true : !!selfUpdate;
    }

    /**
     * Set if all captions are currently muted.
     * @property {Boolean} mute
     * @default false
     */
    get mute()
    {
        return this._mute;
    }
    set mute(mute)
    {
        this._mute = mute;
        this._updateCaptions();
    }

    /**
     * If the captions object should do it's own updating unless you want to manuall
     * seek. In general, self-updating should not be set to false unless the sync
     * of the captions needs to be exact with something else.
     * @property {Boolean} selfUpdate
     * @default true
     */
    set selfUpdate(selfUpdate)
    {
        this._selfUpdate = !!selfUpdate;
        Application.instance.off('update', this.update);

        if (this._selfUpdate)
        {
            Application.instance.on('update', this.update);
        }
    }
    get selfUpdate()
    {
        return this._selfUpdate;
    }

    /**
     * Sets the dictionary object to use for captions. This overrides the current
     * dictionary, if present.
     * @property {Object} data
     */
    set data(dict)
    {
        this._data = dict;

        if (!dict) 
        {
            return;
        }

        var timeFormat = /[0-9]+:[0-9]{2}:[0-9]{2}\.[0-9]{3}/;

        //Loop through each line and make sure the times are formatted correctly
        var lines, i, l, len;
        for (var alias in dict)
        {
            //account for a compressed format that is just an array of lines
            //and convert it to an object with a lines property.
            if (Array.isArray(dict[alias]))
            {
                dict[alias] = {
                    lines: dict[alias]
                };
            }
            lines = dict[alias].lines;
            if (!lines)
            {
                // @if DEBUG
                Debug.log('alias \'' + alias + '\' has no lines!');
                // @endif
                continue;
            }
            len = lines.length;
            for (i = 0; i < len; ++i)
            {
                l = lines[i];
                if (typeof l.start === 'string')
                {
                    if (timeFormat.test(l.start))
                    {
                        l.start = Captions._timeCodeToMilliseconds(l.start);
                    }
                    else
                    {
                        l.start = parseInt(l.start, 10);
                    }
                }
                if (typeof l.end === 'string')
                {
                    if (timeFormat.test(l.end))
                    {
                        l.end = Captions._timeCodeToMilliseconds(l.end);
                    }
                    else
                    {
                        l.end = parseInt(l.end, 10);
                    }
                }
            }
        }
    }
    get data()
    {
        return this._data;
    }

    /**
     * The text field that the captions uses to update.
     * @property {String|createjs.Text|PIXI.Text|PIXI.BitmapText|DOMElement} textField
     */
    set textField(field)
    {
        Captions._setText(this._textField, '');
        this._textField = (typeof field === 'string' ?
            document.getElementById(field) :
            (field || null));
    }
    get textField()
    {
        return this._textField;
    }

    /**
     * Automatically determine how to set the text field text
     * @method _setText
     * @private
     * @static
     * @param {createjs.Text|PIXI.Text|PIXI.BitmapText|DOMElement} field The text field to change
     * @param {String} text The text to set it to
     * @return {createjs.Text|PIXI.Text|PIXI.BitmapText|DOMElement} The text field
     */
    static _setText(field, text)
    {
        if (!field) 
        {
            return;
        }

        //DOM element
        if (field.nodeName)
        {
            field.innerHTML = text;
        }
        //the EaselJS/PIXI v3 style text setting
        else if (field.constructor.prototype.hasOwnProperty('text') ||
            field.hasOwnProperty('text'))
        {
            field.text = text;
        }
        //unsupported field type, oops!
        else
        {
            throw 'Unrecognizable captions text field';
        }
        return field;
    }

    /**
     * Returns if there is a caption under that alias or not.
     * @method  hasCaption
     * @param {String} alias The alias to check against
     * @return {Boolean} Whether the caption was found or not
     */
    hasCaption(alias)
    {
        return this._data ? !!this._data[alias] : false;
    }

    /**
     * A utility function for getting the full text of a caption by alias
     * this can be useful for debugging or tracking purposes.
     * @method  getFullCaption
     * @param {String|Array} alias The alias or Array of aliases for which to get the text.
     *                           Any non-String values in this Array are silently and
     *                           harmlessly ignored.
     * @param {String} [separator=" "] The separation between each line.
     * @return {String} The entire caption, concatinated by the separator.
     */
    getFullCaption(alias, separator)
    {
        if (!this._data) 
        {
            return;
        }

        separator = separator || ' ';

        var result,
            content,
            i;

        if (Array.isArray(alias))
        {
            for (i = 0; i < alias.length; i++)
            {
                if (typeof alias[i] === 'string')
                {
                    content = this.getFullCaption(alias[i], separator);
                    if (!result)
                    {
                        result = content;
                    }
                    else
                    {
                        result += separator + content;
                    }
                }
            }
        }
        else
        {
            //return name if no caption so as not to break lists of mixed SFX and VO
            if (!this._data[alias])
            {
                return alias;
            }

            var lines = this._data[alias].lines;
            for (i = 0; i < lines.length; i++)
            {
                content = lines[i].content;

                if (!result)
                {
                    result = content;
                }
                else
                {
                    result += separator + content;
                }
            }
        }
        return result;
    }

    /**
     * Sets an array of line data as the current caption data to play.
     * @private
     * @method _load
     * @param {String} data The string
     */
    _load(data)
    {
        if (this._destroyed) 
        {
            return;
        }

        //Set the current playhead time
        this._reset();

        //make sure there is data to load, otherwise take it as an empty initialization
        if (!data)
        {
            this._lines = null;
            return;
        }
        this._lines = data.lines;
    }

    /**
     * Reset the captions
     * @private
     * @method _reset
     */
    _reset()
    {
        this._currentLine = -1;
        this._lastActiveLine = -1;
    }

    /**
     * Take the captions timecode and convert to milliseconds
     * format is in HH:MM:ss:mmm
     * @private
     * @method _timeCodeToMilliseconds
     * @param {String} input The input string of the format
     * @return {int} Time in milliseconds
     */
    _timeCodeToMilliseconds(input)
    {
        var lastPeriodIndex = input.lastIndexOf('.');
        var ms = parseInt(input.substr(lastPeriodIndex + 1), 10);
        var parts = input.substr(0, lastPeriodIndex).split(':');
        var h = parseInt(parts[0], 10) * 3600000; //* 60 * 60 * 1000;
        var m = parseInt(parts[1], 10) * 6000; //* 60 * 1000;
        var s = parseInt(parts[2], 10) * 1000;

        return h + m + s + ms;
    }

    /**
     * The playing status.
     * @public
     * @property {Boolean} playing
     * @readOnly
     */
    get playing()
    {
        return this._playing;
    }

    /**
     * Calculate the total duration of the current caption
     * @private
     * @method _getTotalDuration
     */
    _getTotalDuration()
    {
        var lines = this._lines;
        return lines ? lines[lines.length - 1].end : 0;
    }

    /**
     * Get the current duration of the current caption
     * @property {int} currentDuration
     * @readOnly
     */
    get currentDuration()
    {
        return this._currentDuration;
    }

    /**
     * Get the current caption alias.
     * @property {String} currentAlias
     * @readOnly
     */
    get currentAlias()
    {
        return this._currentAlias;
    }

    /**
     * Start the caption playback.
     * @public
     * @method play
     * @param {String} alias The desired caption's alias
     * @param {function} callback The function to call when the caption is finished playing
     */
    play(alias, callback)
    {
        this.stop();
        this._completeCallback = callback;
        this._playing = true;
        this._currentAlias = alias;
        this._load(this._data[alias]);
        this._currentDuration = this._getTotalDuration();

        this.seek(0);
    }

    /**
     * Convience function for stopping captions.
     * @public
     * @method stop
     */
    stop()
    {
        this._playing = false;
        this._currentAlias = null;
        this._lines = null;
        this._completeCallback = null;
        this._reset();
        this._updateCaptions();
    }

    /**
     * Goto a specific time.
     * @public
     * @method seek
     * @param {int} time The time in milliseconds to seek to in the captions
     */
    seek(time)
    {
        //Update the current time
        var currentTime = this._currentTime = time;

        var lines = this._lines;
        if (!lines)
        {
            this._updateCaptions();
            return;
        }

        if (currentTime < lines[0].start)
        {
            this._currentLine = this._lastActiveLine = -1;
            this._updateCaptions();
            return;
        }

        var len = lines.length;
        for (var i = 0; i < len; i++)
        {
            if (currentTime >= lines[i].start && currentTime <= lines[i].end)
            {
                this._currentLine = this._lastActiveLine = i;
                this._updateCaptions();
                break;
            }
            else if (currentTime > lines[i].end)
            {
                //this elseif helps us if there was no line at seek time,
                //so we can still keep track of the last active line
                this._lastActiveLine = i;
                this._currentLine = -1;
                this._updateCaptions();
            }
            else if (currentTime < lines[i].start)
            {
                //in between lines or before the first one
                this._lastActiveLine = i - 1;
                this._currentLine = -1;
                this._updateCaptions();
            }
        }
    }

    /**
     * Callback for when a frame is entered.
     * @private
     * @method _updatePercent
     * @param {number} progress The progress in the current sound as a percentage (0-1)
     */
    _updatePercent(progress)
    {
        if (this._destroyed)
        {
            return;
        }
        this._currentTime = progress * this._currentDuration;
        this._calcUpdate();
    }

    /**
     * Function to update the amount of time elapsed for the caption playback.
     * Call this to advance the caption by a given amount of time.
     * @public
     * @method update
     * @param {int} progress The time elapsed since the last frame in milliseconds
     */
    update(elapsed)
    {
        if (this._destroyed || !this._playing)
        {
            return;
        }
        this._currentTime += elapsed;
        this._calcUpdate();
    }

    /**
     * Calculates the captions after increasing the current time.
     * @private
     * @method _calcUpdate
     */
    _calcUpdate()
    {
        var lines = this._lines;
        if (!lines)
        {
            return;
        }

        //Check for the end of the captions
        var len = lines.length;
        var nextLine = this._lastActiveLine + 1;
        var lastLine = len - 1;
        var currentTime = this._currentTime;

        //If we are outside of the bounds of captions, stop
        if (currentTime >= lines[lastLine].end)
        {
            this.stop();
        }
        else if (nextLine <= lastLine &&
            currentTime >= lines[nextLine].start &&
            currentTime <= lines[nextLine].end)
        {
            this._currentLine = this._lastActiveLine = nextLine;
            this._updateCaptions();
        }
        else if (this._currentLine !== -1 &&
            currentTime > lines[this._currentLine].end)
        {
            this._lastActiveLine = this._currentLine;
            this._currentLine = -1;
            this._updateCaptions();
        }
    }

    /**
     * Updates the text in the managed text field.
     * @private
     * @method _updateCaptions
     */
    _updateCaptions()
    {
        Captions._setText(
            this._textField, //
            (this._currentLine === -1 || this._mute) ? '' : this._lines[this._currentLine].content
        );
    }

    /**
     * Returns duration in milliseconds of given captioned sound alias or alias list.
     * @method getLength
     * @param {String|Array} alias The alias or array of aliases for which to get duration.
     *  Array may contain integers (milliseconds) to account for un-captioned gaps.
     * @return {int} Length/duration of caption in milliseconds.
     */
    getLength(alias)
    {
        var length = 0;
        if (Array.isArray(alias))
        {
            for (var i = 0, len = alias.length; i < len; i++)
            {
                if (typeof alias[i] === 'string')
                {
                    length += this.getLength(alias[i]);
                }
                else if (typeof alias[i] === 'number')
                {
                    length += alias[i];
                }
            }
        }
        else
        {
            if (!this._data[alias])
            {
                return length;
            }

            var lines = this._data[alias].lines;
            length += lines[lines.length - 1].end;
        }

        return parseInt(length);
    }

    /**
     * Destroy this load task and don't use after this
     * @method destroy
     */
    destroy()
    {
        if (this._destroyed)
        {
            return;
        }

        this._destroyed = true;

        this._data = null;
        this._lines = null;
    }
}
