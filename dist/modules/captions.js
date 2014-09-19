/*! CloudKidFramework 0.0.6 */
!function(){"use strict";/**
*  @module Captions
*  @namespace cloudkid
*/
(function(){
	
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
		var captions = new cloudkid.Captions(captionsDictionary);
		captions.play("Alias1");

		// Provide the update to captions
		Application.intance.on('update', captions.update.bind(captions));
	*
	* @class Captions
	* @constructor
	* @param {Dictionary} [captionDictionary=null] The dictionary of captions
	* @param {createjs.Text} [field=null] An text field to use as the output for this captions object
	*/
	var Captions = function(captionDictionary, field)
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
		* A reference to the CreateJS Text object that Captions should be controlling. 
		* Only one text field can be controlled at a time.
		* When using PIXI textfields, textIsProp should be false.
		*
		* @private
		* @property {createjs.Text|PIXI.Text|PIXI.BitmapText} _textField
		*/
		this._textField = null;
		
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
		this._lines = null;
		
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
		* If text should be set on the text field with '.text = ' instead of '.setText()'.
		* When using PIXI textfields, textIsProp should be false.
		* Default is true.
		*
		* @private
		* @property {bool} textIsProp
		*/
		this.textIsProp = true;
		
		/**
		* If this instance has been destroyed already 
		* 
		* @private
		* @property {bool} _isDestroyed
		*/
		this._isDestroyed = false;

		// Initialize
		this.initialize(captionDictionary, field);
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
	* The version number of this library 
	*
	* @public 
	* @property {String} VERSION
	* @static
	*/
	Captions.VERSION = "0.0.6";
	
	/**
	* Constructor for caption.
	*
	* @private
	* @method initialize
	* @param [captionDictionary=null] An object set up in dictionary format of caption objects.
	* @param {createjs.Text|PIXI.Text|PIXI.BitmapText} [field=null] An text field to use as the 
	*	output for this captions object. When using PIXI textfields, textIsProp should be false.
	*/
	p.initialize = function(captionDictionary, field)
	{
		this._lines = [];
		this.setDictionary(captionDictionary || null);
		this.setTextField(field);
	};
	
	/**
	* Mute all of the captions.
	*
	* @public
	* @method setMuteAll
	* @param {bool} muteAll Whether to mute or unmute
	* @static
	*/
	Captions.setMuteAll = function(muteAll)
	{
		_muteAll = muteAll;

		for(var i = 0; i < _instances.length; i++)
		{
			_instances[i]._updateCaptions();
		}
	};
	
	/**
	* If the captions are all currently muted.
	*
	* @public
	* @method getMuteAll
	* @static
	* @return {bool} Whether the captions are all muted
	*/
	Captions.getMuteAll = function()
	{
		return _muteAll;
	};
	
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
			var lines = Array.isArray(dict[alias]) ? dict[alias] : dict[alias].lines;
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
	* Sets the CreateJS Text or Pixi BitmapText/Text object that Captions should control the text of. 
	* Only one text field can be controlled at a time. When using PIXI textfields, textIsProp should be false.
	*
	* @public
	* @method setTextField
	* @param {createjs.Text|PIXI.Text|PIXI.BitmapText} field The CreateJS or PIXI Text object 
	*/
	p.setTextField = function(field)
	{
		if(this._textField)
		{
			if(this.textIsProp)
				this._textField.text = "";
			else
				this._textField.setText("");
		}
		this._textField = field || null;
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
	 * @param {String} alias The alias to get the text of
	 * @param {String} [separator=" "] The separation between each line
	 * @return {String} The entire captions concatinated by the separator
	 */
	p.getFullCaption = function(alias, separator)
	{
		if (!this._captionDict || !this._captionDict[alias]) return;

		separator = separator || " ";

		var result, 
			content, 
			lines = this._captionDict[alias].lines, 
			len = lines.length;

		for (var i = 0; i < len; i++)
		{
			content = lines[i].content;

			if (i === 0)
			{
				result = content;
			}
			else
			{
				result += separator + content;
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
	* @method isPlaying
	* @return {bool} If the caption is playing
	*/
	p.isPlaying = function()
	{ 
		return this._playing; 
	};
	
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
	Object.defineProperty(p, "currentDuration",
	{
		get: function() { return this._currentDuration; }
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
			currentLine = this._lastActiveLine = -1;
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
		if (this._isDestroyed) return;
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
			this._currentLine = -1;
			this._updateCaptions();
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
		if (this._textField)
		{
			var text = (this._currentLine == -1 || _muteAll) ? "" : this._lines[this._currentLine].content;
			if (this.textIsProp)
				this._textField.text = text;
			else
				this._textField.setText(text);
		}
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
	namespace('cloudkid').Captions = Captions;
	
}());}();