/**
*  @module cloudkid
*/
(function(){
	
	// Global classes to use, they will actually be imported in the constructor
	// so that we don't require a specific load order
	var Audio, Application;
	
	/**
	* A class that creates captioning for multimedia content. Captions are
	* created from a dictionary of captions and can be played by alias. Captions 
	* is a singleton class and depends on `cloudkid.Audio` for the progress update.
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
	
		var captions = new cloudkid.Captions(captionsDictionary);
		captions.play("Alias1");
	*
	* @class Captions
	* @constructor
	* @param {Dictionary} [captionDictionary=null] The dictionary of captions
	* @param {createjs.Text} [field=null] An text field to use as the output for this captions object
	*/
	var Captions = function(captionDictionary, field)
	{
		// Import external classes
		Audio = cloudkid.Audio;
		Application = cloudkid.Application;

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
	* An object used as a dictionary with keys that should be the same as sound aliases
	* 
	* @private
	* @property {Dictionary} _captionDict
	*/
	p._captionDict = null;
	
	/** 
	* A reference to the CreateJS Text object that Captions should be controlling. 
	* Only one text field can be controlled at a time.
	* When using PIXI textfields, textIsProp should be false.
	*
	* @private
	* @property {createjs.Text|PIXI.Text|PIXI.BitmapText} _textField
	*/
	p._textField = null;
	
	/** 
	* The function to call when playback is complete. 
	*
	* @private
	* @property {Function} _completeCallback
	*/
	p._completeCallback = null;
	
	/** 
	* The collection of line objects {start:0, end:0, content:""} 
	* 
	* @private
	* @property {Array} _lines
	*/
	p._lines = null;
	
	/** 
	* The duration in milliseconds of the current sound. 
	*
	* @private
	* @property {int} _currentDuration
	*/
	p._currentDuration = 0;
	
	/** 
	* The current playback time 
	*
	* @private
	* @property {int} _currentTime
	*/
	p._currentTime = 0;
	
	/** 
	* Save the current line index 
	*
	* @private
	* @property {int} _currentLine 
	*/
	p._currentLine = -1;
	
	/** 
	* Cache the last active line
	*
	* @private
	* @property {int} _lastActiveLine
	*/
	p._lastActiveLine = -1;
	
	/** 
	* If we're playing 
	*
	* @private
	* @property {bool} _playing 
	*/
	p._playing = false;
	
	/** 
	* The singleton instance of Captions 
	*
	* @private
	* @property {Captions} _instance
	*/
	var _instance = null;
	
	/** 
	* If you want to mute the captions, doesn't remove the current caption 
	*
	* @private 
	* @property {bool} _muteAll
	*/
	var _muteAll = false;
	
	/**
	* If this Captions instance is a 'slave', that doesn't run cloudkid.Audio
	* and must have update() called manually (and passed milliseconds).
	* Default is false.
	*
	* @private
	* @property {bool} _isSlave
	*/
	p._isSlave = false;
	
	/**
	* If text should be set on the text field with '.text = ' instead of '.setText()'.
	* When using PIXI textfields, textIsProp should be false.
	* Default is true.
	*
	* @private
	* @property {bool} textIsProp
	*/
	p.textIsProp = true;

	/**
	* An animation timeline from Animator or PixiAnimator. This is used for syncing captions to audio that is synced
	* with with an animation.
	*
	* @private
	* @property {cloudkid.AnimatorTimeline|cloudkid.PixiAnimator.AnimTimeline} _animTimeline.
	*/
	p._animTimeline = null;
	
	/**
	* If this instance has been destroyed already 
	* 
	* @private
	* @property {bool} _isDestroyed
	*/
	p._isDestroyed = false;
	
	/** 
	* A bound update function to get the progress from Sound with 
	* 
	* @private
	* @property {Function} _boundUpdate
	*/
	p._boundUpdate = null;
	
	/** 
	* A bound completion callback for when Sound has finished playing. 
	* 
	* @private
	* @property {Function} _boundComplete
	*/
	p._boundComplete = null;
	
	/** 
	* The version number of this library 
	*
	* @public 
	* @property {String} VERSION
	* @static
	*/
	Captions.VERSION = "${version}";
	
	/** 
	* Creates the singleton instance of Captions, with an optional dictionary ready to go 
	*
	* @public
	* @method init
	* @param {object} [captionDictionary=null] An object set up in dictionary format of caption objects.
	* @param {createjs.Text} [field=null] An text field to use as the output for this captions object
	* @static
	*/
	Captions.init = function(captionDictionary, field)
	{
		_instance = new Captions(captionDictionary, field);
	};
	
	/**
	*  The singleton instance of Captions 
	*
	*  @static
	*  @readOnly
	*  @public
	*  @property {Captions} instance
	*/
	Object.defineProperty(
		Captions, "instance", 
		{
			get:function(){ return _instance; }
		}
	);
	
	/**
	* Constructor for caption.
	*
	* @private
	* @method initialize
	* @param [captionDictionary=null] An object set up in dictionary format of caption objects.
	* @param {createjs.Text|PIXI.Text|PIXI.BitmapText} [field=null] An text field to use as the output for this captions object. When using PIXI textfields, textIsProp should be false.
	*/
	p.initialize = function(captionDictionary, field)
	{
		this._lines = [];
		this.setDictionary(captionDictionary || null);
		this.setTextField(field);
		this._boundUpdate = this._updatePercent.bind(this);
		this._boundComplete = this._onSoundComplete.bind(this);
		this._updateToAnim = this._updateToAnim.bind(this);
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
		
		if(_instance)
			_instance._updateCaptions();
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
	*  If this Captions instance is a 'slave', that doesn't run cloudkid.Audio
	*  and must have update() called manually (and passed milliseconds).
	*  @property {bool} isSlave
	*  @default false
	*/
	Object.defineProperty(p, "isSlave",
	{
		get: function() { return this._isSlave; },
		set: function(isSlave) { this._isSlave = isSlave; }
	});
	
	/**
	*  Start the caption playback. Captions will tell cloudkid.Audio to play the proper sound.
	*  
	*  @public
	*  @method play
	*  @param {String} alias The desired caption's alias
	*  @param {function} callback The function to call when the caption is finished playing
	*  @return {function} The update function that should be called if captions isSlave is true
	*/
	p.play = function(alias, callback)
	{
		this.stop();
		this._completeCallback = callback;
		this._playing = true;
		this._load(this._captionDict[alias]);

		if (this._isSlave)
		{
			this._currentDuration = this._getTotalDuration();
		}
		else
		{
			this._currentDuration = Audio.instance.getLength(alias) * 1000;

			// Backward compatibility, but you should use the VOPlayer in the Sound or Audio libraries
			Audio.instance.play(alias, this._boundComplete, null, this._boundUpdate);
		}
		this.seek(0);

		if (this._isSlave)
		{
			return this._boundUpdate;
		}
	};
	
	/** 
	* Starts caption playback without controlling the sound or animation. Returns the update
	* function that should be called to control the Captions object.
	* @deprecated Use play(alias) instead, isSlave should be set to true
	* @public
	* @method run
	* @param {String} alias The caption/sound alias
	* @return {function} The update function that should be called
	*/
	p.run = function(alias)
	{
		if (!this._isSlave)
		{
			throw "Captions.isSlave needs to be set to tru to use run";
		}
		return this.play(alias);
	};

	/**
	* Runs a caption synced to the audio of an animation.
	* @deprecated Set Animator.captions or PixiAnimator.captions to set the captions object to use
	* @public
	* @method runWithAnimation
	* @param {cloudkid.AnimatorTimeline|cloudkid.PixiAnimator.AnimTimeline} animTimeline The animation to sync to.
	*/
	p.runWithAnimation = function(animTimeline)
	{
		if(!animTimeline.soundAlias) return;//make sure animation has audio to begin with.
		this.stop();
		this._animTimeline = animTimeline;
		this._load(this._captionDict[animTimeline.soundAlias]);
		Application.instance.on("update", this._updateToAnim);
	};
	
	/** 
	* Is called when cloudkid.Audio finishes playing. Is not called if 
	* a cloudkid.AudioAnimation finishes playing, as then stop() is called.
	* 
	* @private
	* @method _onSoundComplete
	*/
	p._onSoundComplete = function()
	{
		var callback = this._completeCallback;
		
		this.stop();
		
		if(callback)
			callback();
	};
	
	/**
	* Convience function for stopping captions. Is also called by 
	* cloudkid.AudioAnimation when it is finished.
	*
	* @public
	* @method stop
	*/
	p.stop = function()
	{
		if(!this._isSlave && this._playing)
		{
			Audio.instance.stop();
			this._playing = false;
		}
		if(this._animTimeline)
		{
			this._animTimeline = null;
			Application.instance.off("update", this._updateToAnim);
		}
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
	* Callback for when a frame is entered, to sync to an animation's audio.
	*
	* @private
	* @method _updateToAnim
	*/
	p._updateToAnim = function()
	{
		//this should catch most interruptions to caption or animation playback, but if an animation is stopped before the sound plays, then this
		//might not catch it
		if(!this._animTimeline || //no longer have a timeline to use
			(!this._animTimeline.playSound && !this._animTimeline.soundInst) || //timeline has been cleaned up
			(this._animTimeline.soundInst && !this._animTimeline.soundInst.isValid))//audio on timeline is no longer valid
		{
			this.stop();
		}
		else if(this._animTimeline.soundInst)//make sure the audio instance exists - if it doesn't, it hasn't been played yet
		{
			this.seek(this._animTimeline.soundInst.position);
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
	* @method updateTime
	* @param {int} progress The time elapsed since the last frame in milliseconds
	*/
	p.updateTime = function(elapsed)
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
		if(this._textField)
		{
			var text = (this._currentLine == -1 || _muteAll) ? "" : this._lines[this._currentLine].content;
			if(this.textIsProp)
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
		
		this._isDestroyed = true;
		
		if(_instance === this)
			_instance = null;
		
		this._captionDict = null;
		this._lines = null;
	};
	
	// Assign to the namespacing
	namespace('cloudkid').Captions = Captions;
	
}());