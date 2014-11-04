/*! SpringRoll 0.0.6 */
!function(){"use strict";/**
*  @module Captions
*  @namespace springroll
*/
(function(undefined){
	
	// Import class
	var Application = include('springroll.Application');

	/**
	* A class that creates captioning for multimedia content. Captions are
	* created from a dictionary of captions and can be played by alias. Captions
	* is a singleton class.
	*
	* @example
		var captionsDictionary = {
			"Alias1": [
				{"start":0, "end":2000, "content":"Ohh that looks awesome!"}
			],
			"Alias2": [
				{"start":0, "end":2000, "content":"Love it, absolutely love it!"}
			]
		};
	
		// initialize the captions
		var captions = new springroll.Captions(captionsDictionary);
		captions.play("Alias1");
	*
	* @class Captions
	* @constructor
	* @param {Dictionary} [captionDictionary=null] The dictionary of captions
	* @param {createjs.Text|PIXI.Text|PIXI.BitmapText|DOMElement|String} [field=null] An text field to use as the output for this captions object,
	*  if a string type is supplied, captions will use the DOMElement by id.
	* @param {Boolean} [selfUpdate=true] If the captions should update itself
	*/
	var Captions = function(captionDictionary, field, selfUpdate)
	{
		// Add to the instances
		_instances.push(this);

		/**
		* An object used as a dictionary with keys that should be the same as sound aliases
		*
		* @private
		* @property {Dictionary} _captionDict
		*/
		this._captionDict = null;
		
		/**
		* A reference to the Text object that Captions should be controlling.
		* Only one text field can be controlled at a time.
		*
		* @private
		* @property {createjs.Text|PIXI.Text|PIXI.BitmapText|DOMElement} _textField
		*/
		this._textField = (typeof field === "string" ? document.getElementById(field) : (field || null));
		
		/**
		* The function to call when playback is complete.
		*
		* @private
		* @property {Function} _completeCallback
		*/
		this._completeCallback = null;
		
		/**
		* The collection of line objects {start:0, end:0, content:""}
		*
		* @private
		* @property {Array} _lines
		*/
		this._lines = [];
		
		/**
		* The duration in milliseconds of the current sound.
		*
		* @private
		* @property {int} _currentDuration
		*/
		this._currentDuration = 0;
		
		/**
		* The current playback time
		*
		* @private
		* @property {int} _currentTime
		*/
		this._currentTime = 0;
		
		/**
		* Save the current line index
		*
		* @private
		* @property {int} _currentLine
		*/
		this._currentLine = -1;
		
		/**
		* Cache the last active line
		*
		* @private
		* @property {int} _lastActiveLine
		*/
		this._lastActiveLine = -1;
		
		/**
		* If we're playing
		*
		* @private
		* @property {bool} _playing
		*/
		this._playing = false;
		
		/**
		* If this instance has been destroyed already
		*
		* @private
		* @property {bool} _isDestroyed
		*/
		this._isDestroyed = false;

		// Bind the update function
		this.update = this.update.bind(this);

		/**
		*  If the captions object should do it's own update
		*  @property {Boolean} _selfUpdate
		*  @private
		*  @default true
		*/
		this.selfUpdate = this._selfUpdate = (selfUpdate === undefined ? true : selfUpdate);

		// Set the captions dictionary
		this.setDictionary(captionDictionary || null);
	};
	
	/**
	* Reference to the inherieted task
	*
	* @private
	* @property {Object} p
	*/
	var p = Captions.prototype;
	
	/**
	* If you want to mute the captions, doesn't remove the current caption
	*
	* @private
	* @property {bool} _muteAll
	*/
	var _muteAll = false;

	/**
	*  The collection of instances created
	*  @property {array} _instances
	*  @private
	*/
	var _instances = [];

	/**
	* Set if all captions are currently muted.
	*
	* @property {Boolean} muteAll
	* @static
	*/
	Object.defineProperty(Captions, 'muteAll', {
		get : function()
		{
			return _muteAll;
		},
		set : function(muteAll)
		{
			_muteAll = muteAll;

			for(var i = 0; i < _instances.length; i++)
			{
				_instances[i]._updateCaptions();
			}
		}
	});

	/**
	*  If the captions object should do it's own updating unless you want to manuall
	*  seek. In general, self-updating should not be set to false unless the sync
	*  of the captions needs to be exact with something else.
	*  @property {Boolean} selfUpdate
	*  @default true
	*/
	Object.defineProperty(p, 'selfUpdate', {
		set : function(selfUpdate)
		{
			this._selfUpdate = !!selfUpdate;
			Application.instance.off('update', this.update);

			if (this._selfUpdate)
			{
				Application.instance.on('update', this.update);
			}
		},
		get : function()
		{
			return this._selfUpdate;
		}
	});
	
	/**
	* Sets the dictionary object to use for captions. This overrides the current dictionary, if present.
	*
	* @public
	* @method setDictionary
	* @param {Dictionary} dict The dictionary object to use for captions.
	*/
	p.setDictionary = function(dict)
	{
		this._captionDict = dict;

		if(!dict) return;

		var timeFormat = /[0-9]+\:[0-9]{2}\:[0-9]{2}\.[0-9]{3}/;
		//Loop through each line and make sure the times are formatted correctly
		for(var alias in dict)
		{
			//account for a compressed format that is just an array of lines
			//and convert it to an object with a lines property.
			if(Array.isArray(dict[alias]))
			{
				dict[alias] = {lines:dict[alias]};
			}
			var lines = dict[alias].lines;
			if(!lines)
			{
				Debug.log("alias '" + alias + "' has no lines!");
				continue;
			}
			for(var i = 0, len = lines.length; i < len; ++i)
			{
				var l = lines[i];
				if(typeof l.start == "string")
				{
					if(timeFormat.test(l.start))
						l.start = _timeCodeToMilliseconds(l.start);
					else
						l.start = parseInt(l.start, 10);
				}
				if(typeof l.end == "string")
				{
					if(timeFormat.test(l.end))
						l.end = _timeCodeToMilliseconds(l.end);
					else
						l.end = parseInt(l.end, 10);
				}
			}
		}
	};

	/**
	*  The text field that the captions uses to update.
	*  @property {createjs.Text|PIXI.Text|PIXI.BitmapText|DOMElement} textField
	*/
	Object.defineProperty(p, 'textField', {
		set: function(field)
		{
			setText(this._textField, '');
			this._textField = field || null;
		},
		get : function()
		{
			return this._textField;
		}
	});

	/**
	 * Automatically determine how to set the text field text
	 * @method setText
	 * @private
	 * @static
	 * @param {createjs.Text|PIXI.Text|PIXI.BitmapText|DOMElement} field The text field to change
	 * @param {string} text The text to set it to
	 * @return {createjs.Text|PIXI.Text|PIXI.BitmapText|DOMElement} The text field
	 */
	var setText = function(field, text)
	{
		if (!field) return;

		// PIXI style text setting
		if (typeof field.setText === "function")
		{
			field.setText(text);
		}
		// DOM element
		else if (field.nodeName)
		{
			field.innerHTML = text;
		}
		// The CreateJS style text setting
		else if (field.text !== undefined)
		{
			field.text = text;
		}
		// Unsupported field type, oops!
		else
		{
			throw "Unrecognizable captions text field";
		}
		return field;
	};
	
	/**
	 * Returns if there is a caption under that alias or not.
	 *
	 * @method  hasCaption
	 * @param {String} alias The alias to check against
	 * @return {bool} Whether the caption was found or not
	 */
	p.hasCaption = function(alias)
	{
		return this._captionDict ? !!this._captionDict[alias] : false;
	};

	/**
	 * A utility function for getting the full text of a caption by alias
	 * this can be useful for debugging purposes.
	 *
	 * @method  getFullCaption
	 * @param {String|Array} alias The alias or Array of aliases for which to get the text (any non-String values in this Array are silently and harmlessly ignored)
	 * @param {String} [separator=" "] The separation between each line
	 * @return {String} The entire captions concatinated by the separator
	 */
	p.getFullCaption = function(alias, separator)
	{
		if (!this._captionDict || !this._captionDict[alias]) return;

		separator = separator || " ";

		var result, 
			content,
			i;

		if(Array.isArray(alias))
		{
			for(i = 0; i < alias.length; i++)
			{
				if(typeof alias[i] == 'string')
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
			var lines = this._captionDict[alias].lines,
			len = lines.length;

			for (i = 0; i < len; i++)
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
	};
	
	/**
	* Sets an array of line data as the current caption data to play.
	*
	* @private
	* @method _load
	* @param {String} data The string
	*/
	p._load = function(data)
	{
		if (this._isDestroyed) return;
		
		// Set the current playhead time
		this._reset();
		
		//make sure there is data to load, otherwise take it as an empty initialization
		if (!data)
		{
			this._lines = null;
			return;
		}
		this._lines = data.lines;
	};
	
	/**
	*  Reset the captions
	*
	*  @private
	*  @method _reset
	*/
	p._reset = function()
	{
		this._currentLine = -1;
		this._lastActiveLine = -1;
	};
	
	/**
	*  Take the captions timecode and convert to milliseconds
	*  format is in HH:MM:ss:mmm
	*
	*  @private
	*  @method _timeCodeToMilliseconds
	*  @param {String} input The input string of the format
	*  @return {int} Time in milliseconds
	*/
	function _timeCodeToMilliseconds(input)
	{
		var lastPeriodIndex = input.lastIndexOf(".");
		var ms = parseInt(input.substr(lastPeriodIndex + 1), 10);
		var parts = input.substr(0, lastPeriodIndex).split(":");
		var h = parseInt(parts[0], 10) * 3600000;//* 60 * 60 * 1000;
		var m = parseInt(parts[1], 10) * 6000;// * 60 * 1000;
		var s = parseInt(parts[2], 10) * 1000;
		
		return h + m + s + ms;
	}
	
	/**
	* The playing status.
	*
	* @public
	* @property {Boolean} playing
	* @readOnly
	*/
	Object.defineProperty(p, 'playing', {
		get : function()
		{
			return this._playing;
		}
	});
	
	/**
	*  Calculate the total duration of the current caption
	*  @private
	*  @method _getTotalDuration
	*/
	p._getTotalDuration = function()
	{
		var lines = this._lines;
		return lines ? lines[lines.length - 1].end : 0;
	};
	
	/**
	*  Get the current duration of the current caption
	*  @property {int} currentDuration
	*  @readOnly
	*/
	Object.defineProperty(p, 'currentDuration', {
		get: function()
		{
			return this._currentDuration;
		}
	});
	
	/**
	*  Start the caption playback.
	*
	*  @public
	*  @method play
	*  @param {String} alias The desired caption's alias
	*  @param {function} callback The function to call when the caption is finished playing
	*/
	p.play = function(alias, callback)
	{
		this.stop();
		this._completeCallback = callback;
		this._playing = true;
		this._load(this._captionDict[alias]);
		this._currentDuration = this._getTotalDuration();

		this.seek(0);
	};
	
	/**
	* Convience function for stopping captions.
	*
	* @public
	* @method stop
	*/
	p.stop = function()
	{
		this._playing = false;
		this._lines = null;
		this._completeCallback = null;
		this._reset();
		this._updateCaptions();
	};
	
	/**
	* Goto a specific time.
	*
	* @public
	* @method seek
	* @param {int} time The time in milliseconds to seek to in the captions
	*/
	p.seek = function(time)
	{
		// Update the current time
		var currentTime = this._currentTime = time;
		
		var lines = this._lines;
		if(!lines)
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
		
		for(var i = 0; i < len; i++)
		{
			if (currentTime >= lines[i].start && currentTime <= lines[i].end)
			{
				this._currentLine = this._lastActiveLine = i;
				this._updateCaptions();
				break;
			}
			else if(currentTime > lines[i].end)
			{
				// this elseif helps us if there was no line at seek time,
				// so we can still keep track of the last active line
				this._lastActiveLine = i;
				this._currentLine = -1;
				this._updateCaptions();
			}
			else if(currentTime < lines[i].start)
			{
				//in between lines or before the first one
				this._lastActiveLine = i - 1;
				this._currentLine = -1;
				this._updateCaptions();
			}
		}
	};
	
	/**
	* Callback for when a frame is entered.
	*
	* @private
	* @method _updatePercent
	* @param {number} progress The progress in the current sound as a percentage (0-1)
	*/
	p._updatePercent = function(progress)
	{
		if (this._isDestroyed) return;
		this._currentTime = progress * this._currentDuration;
		this._calcUpdate();
	};
	
	/**
	* Function to update the amount of time elapsed for the caption playback.
	* Call this to advance the caption by a given amount of time.
	*
	* @public
	* @method update
	* @param {int} progress The time elapsed since the last frame in milliseconds
	*/
	p.update = function(elapsed)
	{
		if (this._isDestroyed || !this._playing) return;
		this._currentTime += elapsed;
		this._calcUpdate();
	};
	
	/**
	* Calculates the captions after increasing the current time.
	*
	* @private
	* @method _calcUpdate
	*/
	p._calcUpdate = function()
	{
		var lines = this._lines;
		if(!lines)
			return;
		
		// Check for the end of the captions
		var len = lines.length;
		var nextLine = this._lastActiveLine + 1;
		var lastLine = len - 1;
		var currentTime = this._currentTime;
		
		// If we are outside of the bounds of captions, stop
		if (currentTime >= lines[lastLine].end)
		{
			this.stop();
		}
		else if (nextLine <= lastLine && currentTime >= lines[nextLine].start && currentTime <= lines[nextLine].end)
		{
			this._currentLine = this._lastActiveLine = nextLine;
			this._updateCaptions();
		}
		else if (this._currentLine != -1 && currentTime > lines[this._currentLine].end)
		{
			this._lastActiveLine = this._currentLine;
			this._currentLine = -1;
			this._updateCaptions();
		}
	};
	
	/**
	*  Updates the text in the managed text field.
	*
	*  @private
	*  @method _updateCaptions
	*/
	p._updateCaptions = function()
	{
		setText(
			this._textField,
			(this._currentLine == -1 || _muteAll) ? '' : this._lines[this._currentLine].content
		);
	};

	/**
	 * Returns duration in ms of given captioned sound alias
	 *
	 * @method  getLength
	 * @param {String | Array} alias The alias or array of aliases for which to get duration. Array may contain integers (ms) to account for un-captioned gaps.
	 * @return {int} Length/duration of caption in ms
	 */
	p.getLength = function(alias)
	{
		var length = 0;
		if(Array.isArray(alias))
		{
			for(var i = 0; i < alias.length; i++)
			{
				if (typeof alias[i] == 'string')
				{
					length += this.getLength(alias[i]);
				}
				else if(typeof alias[i] == 'number')
				{
					length += alias[i];
				}
			}
		}
		else
		{
			var lines = this._captionDict[alias].lines;
			length += lines[lines.length - 1].end;
		}

		return parseInt(length);
	};
	
	/**
	*  Destroy this load task and don't use after this
	*
	*  @method destroy
	*/
	p.destroy = function()
	{
		if (this._isDestroyed) return;

		var i = _instances.indexOf(this);
		if (i > -1)
		{
			_instances.splice(i, 1);
		}
		
		this._isDestroyed = true;
		
		this._captionDict = null;
		this._lines = null;
	};
	
	// Assign to the namespacing
	namespace('springroll').Captions = Captions;
	
}());}();