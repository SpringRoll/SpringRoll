/*! SpringRoll 0.3.11 */
/**
 * @module EaselJS Cutscene
 * @namespace springroll.easeljs
 * @requires Core, Tasks, EaselJS Display, EaselJS Utilities
 */
(function()
{
	var Debug,
		Container = include('createjs.Container'),
		BitmapUtils,
		Application,
		LoadTask,
		TaskManager,
		Sound,
		ListTask;

	/**
	*  Cutscene is a class for playing a single EaselJS animation synced to a
	*  single audio file with springroll.Sound, with optional captions. Utilizes the Tasks module.
	*
	*  @class Cutscene
	*  @constructor
	*  @param {Object} options The runtime specific setup data for the cutscene.
	*  @param {String|Display} options.display The display or display id of the EaselJSDisplay
	*                                          to draw on.
	*  @param {String} options.configUrl The url of the json config file describing the cutscene.
	*                                    See the example project.
	*  @param {Function} [options.loadCallback] A function to call when loading is complete.
	*  @param {String} [options.pathReplaceTarg] A string found in the paths of images that should
	*                                            be replaced with another value.
	*  @param {String} [options.pathReplaceVal] The string to use when replacing
	*                                           options.pathReplaceTarg.
	*  @param {Number} [options.imageScale=1] Scaling to apply to all images loaded for the
	*                                         cutscene.
	*  @param {Captions} [options.captions] A Captions instance to display captions text on.
	*/
	var Cutscene = function(options)
	{
		if(!Application)
		{
			Debug = include('springroll.Debug', false);
			Application = include('springroll.Application');
			LoadTask = include('springroll.LoadTask');
			TaskManager = include('springroll.TaskManager');
			Sound = include('springroll.Sound');
			ListTask = include('springroll.ListTask');
			BitmapUtils = include('springroll.easeljs.BitmapUtils');
		}

		Container.call(this);

		if(!options)
			throw new Error("need options to create Cutscene");

		/**
		*	When the cutscene is ready to use
		*	@property {Boolean} isReady
		*	@public
		*/
		this.isReady = false;

		/**
		*	The framerate the cutscene should play at.
		*	@property {int} framerate
		*	@private
		*/
		this.framerate = 0;

		/**
		*	Reference to the display we are drawing on
		*	@property {Display} display
		*	@public
		*/
		this.display = typeof options.display == "string" ?
			Application.instance.getDisplay(options.display) :
			options.display;

		/**
		*	The source url for the config until it is loaded, then the config object.
		*	@property {String|Object} config
		*	@private
		*/
		this.config = options.configUrl;

		/**
		*	The scaling value for all images.
		*	@property {Number} imageScale
		*	@private
		*/
		this.imageScale = options.imageScale || 1;

		/**
		*	A string found in the paths of images that should be replaced with another value.
		*	@property {String} pathReplaceTarg
		*	@private
		*/
		this.pathReplaceTarg = options.pathReplaceTarg || null;

		/**
		*	The string to use when replacing options.pathReplaceTarg.
		*	@property {String} pathReplaceVal
		*	@private
		*/
		this.pathReplaceVal = options.pathReplaceVal || null;

		/**
		*	The TaskManager used to load up assets.
		*	@property {TaskManager} _taskMan
		*	@private
		*/
		this._taskMan = null;

		/**
		*	The time elapsed in seconds.
		*	@property {Number} _elapsedTime
		*	@private
		*/
		this._elapsedTime = 0;

		/**
		*	All audio aliases used by this Cutscene, for preloading and later unloading.
		*	@property {Array} _audioAliases
		*	@private
		*/
		this._audioAliases = null;

		/**
		*	Time sorted list of audio that needs to be played, as well as information on if they
		*	should be synced or not.
		*	@property {Array} _audio
		*	@private
		*/
		this._audio = null;

		/**
		*	Index of the sound that is next up in _audio.
		*	@property {int} _audioIndex
		*	@private
		*/
		this._audioIndex = 0;

		/**
		*	Time sorted list of audio that needs to be played, as well as information on if they
		*	should be synced or not.
		*	@property {Array} _audio
		*	@private
		*/
		this._audio = null;

		/**
		*	The clip that is being animated.
		*	@property {createjs.MovieClip} _clip
		*	@private
		*/
		this._clip = null;

		/**
		*	The queue of sound instances of playing audio that the animation should be synced to.
		*	Only the most recent active one will be synced to.
		*	@property {Array} _activeSyncAudio
		*	@private
		*/
		this._activeSyncAudio = [];

		/**
		*	The time in seconds into the animation that the current synced audio started.
		*	@property {Number} _soundStartTime
		*	@private
		*/
		this._soundStartTime = -1;

		/**
		*	Array of active SoundInstances that are not the currently synced one.
		*	@property {Array} _activeAudio
		*	@private
		*/
		this._activeAudio = [];

		/**
		*	If the animation has finished playing.
		*	@property {Boolean} _animFinished
		*	@private
		*/
		this._animFinished = false;

		/**
		*	If the audio has finished playing.
		*	@property {Boolean} _audioFinished
		*	@private
		*/
		this._audioFinished = false;

		/**
		*	The Captions object to use to manage captions.
		*	@property {Captions} _captionsObj
		*	@private
		*/
		this._captionsObj = options.captions || null;

		// Make sure the captions don't update themselves
		if (this._captionsObj) this._captionsObj.selfUpdate = false;

		/**
		*	The function to call when loading is complete.
		*	@property {Function} _loadCallback
		*	@private
		*/
		this._loadCallback = options.loadCallback || null;

		/**
		*	The function to call when playback is complete.
		*	@property {Function} _endCallback
		*	@private
		*/
		this._endCallback = null;
		
		/**
		*	Names of library (window.lib) items to delete when the cutscene is destroyed.
		*	@property {Array} _libItemsToUnload
		*	@private
		*/
		this._libItemsToUnload = [];
		
		/**
		*	Names of image (window.images) entries to unload when the cutscene is destroyed.
		*	@property {Array} _imagesToUnload
		*	@private
		*/
		this._imagesToUnload = [];

		//bind some callbacks
		this.update = this.update.bind(this);
		this.resize = this.resize.bind(this);

		this.setup();
	};

	var p = extend(Cutscene, Container);

	/**
	*   Called from the constructor to complete setup and start loading.
	*
	*   @method setup
	*   @private
	*/
	p.setup = function()
	{
		this.display.stage.addChild(this);

		// create a texture from an image path
		this._taskMan = new TaskManager([new LoadTask(
			"config", this.config, this.onConfigLoaded.bind(this)
		)]);

		this._taskMan.on(TaskManager.ALL_TASKS_DONE, this.onLoadComplete.bind(this));
		this._taskMan.startAll();
	};

	/**
	*	Callback for when the config file is loaded.
	*	@method onConfigLoaded
	*	@param {LoaderResult} result The loaded result.
	*	@private
	*/
	p.onConfigLoaded = function(result)
	{
		this.config = result.content;

		//parse config
		this.framerate = this.config.settings.fps;

		//figure out what to load
		var manifest = [];
		//the javascript file
		manifest.push({id:"clip", src:this.config.settings.clip});
		//all the images
		var url;
		for (var key in this.config.images)
		{
			url = this.pathReplaceTarg ?
				this.config.images[key].replace(this.pathReplaceTarg, this.pathReplaceVal) :
				this.config.images[key];
			manifest.push({id:key, src:url});
		}

		this._taskMan.addTask(new ListTask("art", manifest, this.onArtLoaded.bind(this)));
		if(this.config.settings.audioAlias)
		{
			this._audioAliases = [this.config.settings.audioAlias];
			this._audio = [{alias:this.config.settings.audioAlias, start:0, sync:true}];
		}
		else if(this.config.settings.audio)
		{
			this._audio = this.config.settings.audio.slice();
			this._audio.sort(audioSorter);
			this._audioAliases = [];
			for(var i = 0, length = this._audio.length; i < length; ++i)
			{
				if(this._audioAliases.indexOf(this._audio[i].alias) == -1)
					this._audioAliases.push(this._audio[i].alias);
			}
		}
		else
		{
			if (true && Debug) Debug.error("Cutscene really needs some audio to play");
			return;
		}
		if(this._audioAliases.length)
		{
			this._taskMan.addTask(Sound.instance.createPreloadTask("audio",
				this._audioAliases, this.onAudioLoaded));
		}
	};

	function audioSorter(a, b)
	{
		return a.start - b.start;
	}

	/**
	*	Callback for when the audio has been preloaded.
	*	@method onAudioLoaded
	*	@private
	*/
	p.onAudioLoaded = function()
	{
		//do nothing
	};

	/**
	*	Callback for when all art assets have been loaded.
	*	@method onArtLoaded
	*	@param {Object} results The loaded results.
	*	@private
	*/
	p.onArtLoaded = function(results)
	{
		if(!window.images)
			window.images = {};
		var atlasData = {}, atlasImages = {}, id;

		var result, imgScale, key;
		for (id in results)
		{
			result = results[id].content;
			if(id.indexOf("atlasData_") === 0)//look for spritesheet data
			{
				atlasData[id.replace("atlasData_", "")] = result;
			}
			else if(id.indexOf("atlasImage_") === 0)//look for spritesheet images
			{
				atlasImages[id.replace("atlasImage_", "")] = result;
			}
			else if(id == "clip")//look for the javascript animation file
			{
				//the javascript file
				
				//get javascript text
				var text = result.text;
				if(!text) continue;
				//split into the initialization functions, that take 'lib' as a parameter
				var textArray = text.split(/[\(!]function\s*\(/);
				//go through each initialization function
				for(var i = 0; i < textArray.length; ++i)
				{
					text = textArray[i];
					if(!text) continue;
					//determine what the 'lib' parameter has been minified into
					var libName = text.substring(0, text.indexOf(","));
					if(!libName) continue;
					//get all the things that are 'lib.X = <stuff>'
					var varFinder = new RegExp("\\(" + libName + ".(\\w+)\\s*=", "g");
					var foundName = varFinder.exec(text);
					while(foundName)
					{
						//keep track of all library items in the js file
						this._libItemsToUnload.push(foundName[1]);
						foundName = varFinder.exec(text);
					}
				}
				
				//if bitmaps need scaling, then do black magic to the object prototypes so the
				//scaling is built in
				if(this.imageScale != 1)
				{
					imgScale = this.imageScale;
					for (key in this.config.images)
					{
						BitmapUtils.replaceWithScaledBitmap(key, imgScale);
					}
				}
			}
			else//anything left must be individual images that we were expecting
			{
				images[id] = result;
				this._imagesToUnload.push(id);
			}
		}
		for (id in atlasData)//if we loaded any spritesheets, load them up
		{
			if(atlasData[id] && atlasImages[id])
			{
				BitmapUtils.loadSpriteSheet(
					atlasData[id],
					atlasImages[id],
					this.imageScale);
				this._imagesToUnload.push(atlasImages[id]);
			}
		}
	};

	/**
	*	Callback for when all loading is complete.
	*	@method onLoadComplete
	*	@param {Event} evt An event
	*	@private
	*/
	p.onLoadComplete = function(evt)
	{
		this._taskMan.off();
		this._taskMan.destroy();
		this._taskMan = null;

		var clip = this._clip = new lib[this.config.settings.clipClass]();
		//if the animation was for the older ComicCutscene, we should handle it gracefully
		//so if the clip only has one frame or is a container, then we get the child of the clip
		//as the animation
		if(!this._clip.timeline || this._clip.timeline.duration == 1)
		{
			clip = this._clip.getChildAt(0);
		}
		clip.mouseEnabled = false;
		clip.framerate = this.framerate;
		clip.tickEnabled = false;
		//internally, movieclip has to be playing to change frames during tick() or advance().
		clip.gotoAndPlay(0);
		clip.loop = false;
		this.addChild(this._clip);

		this.resize(this.display.width, this.display.height);
		Application.instance.on("resize", this.resize);

		this.isReady = true;

		if(this._loadCallback)
		{
			this._loadCallback();
			this._loadCallback = null;
		}
	};

	/**
	*	Listener for when the Application is resized.
	*	@method resize
	*	@param {int} width The new width of the display.
	*	@param {int} height The new height of the display.
	*	@private
	*/
	p.resize = function(width, height)
	{
		if(!this._clip) return;

		var settings = this.config.settings;
		var designedRatio = settings.designedWidth / settings.designedHeight,
			currentRatio = width / height,
			scale;

		if(designedRatio > currentRatio)
		{
			//current ratio is narrower than the designed ratio, scale to width
			scale = width / settings.designedWidth;
			this.x = 0;
			this.y = (height - settings.designedHeight * scale) * 0.5;
		}
		else
		{
			scale = height / settings.designedHeight;
			this.x = (width - settings.designedWidth * scale) * 0.5;
			this.y = 0;
		}
		this._clip.scaleX = this._clip.scaleY = scale;
	};

	/**
	*	Starts playing the cutscene.
	*	@method start
	*	@param {Function} callback The function to call when playback is complete.
	*	@public
	*/
	p.start = function(callback)
	{
		this._endCallback = callback;

		this._elapsedTime = 0;
		this._animFinished = false;
		this._audioFinished = false;
		for(var i = 0; i < this._audio.length; ++i)
		{
			var data = this._audio[i];
			if(data.start === 0)
			{
				var alias = data.alias;
				var instanceRef = {};
				if(data.sync)
				{
					var audio = Sound.instance.play(
						alias,
						this._audioCallback.bind(this, instanceRef));
					this._activeSyncAudio.unshift(audio);
					instanceRef.instance = audio;
					audio._audioData = data;
					this._soundStartTime = data.start;
					if(this._captionsObj)
					{
						this._captionsObj.play(alias);
					}
				}
				else
				{
					var instance = Sound.instance.play(
						alias,
						this._audioCallback.bind(this, instanceRef));
					instanceRef.instance = instance;
					this._activeAudio.push(instance);
				}
				++this._audioIndex;
			}
			else
				break;
		}

		Application.instance.on("update", this.update);
	};

	/**
	*	Callback for when the audio has finished playing.
	*	@method _audioCallback
	*	@private
	*/
	p._audioCallback = function(instanceRef)
	{
		var index = this._activeSyncAudio.indexOf(instanceRef.instance);
		if(index != -1)
		{
			if(index === 0)
				this._activeSyncAudio.shift();
			else
				this._activeSyncAudio.splice(index, 1);

			if(this._activeSyncAudio.length < 1)
			{
				this._audioFinished = true;
				this._soundStartTime = -1;
				if(this._captionsObj)
					this._captionsObj.stop();
				if(this._animFinished)
				{
					this.stop(true);
				}
			}
			else
			{
				var data = this._activeSyncAudio[0]._audioData;
				this._soundStartTime = data.start;
				if(this._captionsObj)
				{
					this._captionsObj.play(data.alias);
				}
			}
		}
		else
		{
			index = this._activeAudio.indexOf(instanceRef.instance);
			if(index != -1)
				this._activeAudio.splice(index, 1);
		}
	};

	/**
	*	Listener for frame updates.
	*	@method update
	*	@param {int} elapsed Time in milliseconds
	*	@private
	*/
	p.update = function(elapsed)
	{
		if(this._animFinished) return;

		//update the elapsed time first, in case it starts audio
		if(!this._activeSyncAudio.length)
			this._elapsedTime += elapsed * 0.001;

		for(var i = this._audioIndex; i < this._audio.length; ++i)
		{
			var data = this._audio[i];
			if(data.start <= this._elapsedTime)
			{
				var alias = data.alias;
				var instanceRef = {};
				if(data.sync)
				{
					this._audioFinished = false;
					var audio = Sound.instance.play(
						alias,
						this._audioCallback.bind(this, instanceRef));
					this._activeSyncAudio.unshift(audio);
					instanceRef.instance = audio;
					audio._audioData = data;
					this._soundStartTime = data.start;
					if(this._captionsObj)
					{
						this._captionsObj.play(alias);
					}
				}
				else
				{
					var instance = Sound.instance.play(
						alias,
						{
							complete: this._audioCallback.bind(this, instanceRef),
							offset: (this._elapsedTime - data.start) * 1000
						});
					instanceRef.instance = instance;
					this._activeAudio.push(instance);
				}
				++this._audioIndex;
			}
			else
				break;
		}

		if(this._activeSyncAudio.length)
		{
			var pos = this._activeSyncAudio[0].position * 0.001;
			//sometimes (at least with the flash plugin), the first check of the
			//position would be very incorrect
			if(this._elapsedTime === 0 && pos > elapsed * 2)
			{
				//do nothing here
			}
			else
			{
				//save the time elapsed
				this._elapsedTime = this._soundStartTime + pos;
			}
		}

		if(this._captionsObj && this._soundStartTime >= 0)
		{
			this._captionsObj.seek(this._activeSyncAudio[0].position);
		}
		if(!this._animFinished)
		{
			//set the elapsed time of the clip
			var clip = (!this._clip.timeline || this._clip.timeline.duration == 1) ?
				this._clip.getChildAt(0) :
				this._clip;
			clip.elapsedTime = this._elapsedTime;
			clip.advance();
			if(clip.currentFrame == clip.timeline.duration)
			{
				this._animFinished = true;
				if(this._audioFinished)
				{
					this.stop(true);
				}
			}
		}
	};

	/**
	*	Stops playback of the cutscene.
	*	@method stop
	*	@param {Boolean} [doCallback=false] If the end callback should be performed.
	*	@public
	*/
	p.stop = function(doCallback)
	{
		Application.instance.off("update", this.update);
		var i;
		for(i = 0; i < this._activeSyncAudio.length; ++i)
			this._activeSyncAudio[i].stop();
		for(i = 0; i < this._activeAudio.length; ++i)
			this._activeAudio[i].stop();
		if(this._captionsObj)
			this._captionsObj.stop();

		if(doCallback && this._endCallback)
		{
			this._endCallback();
			this._endCallback = null;
		}
	};

	/**
	*	Destroys the cutscene.
	*	@method destroy
	*	@public
	*/
	p.destroy = function()
	{
		Application.instance.off("resize", this.resize);
		this.removeAllChildren(true);
		//unload audio
		Sound.instance.unload(this._audioAliases);
		//unload library stuff
		var i;
		for(i = this._libItemsToUnload.length - 1; i >= 0; --i)
		{
			delete lib[this._libItemsToUnload[i]];
		}
		for(i = this._imagesToUnload.length - 1; i >= 0; --i)
		{
			var img = this._imagesToUnload[i];
			if(typeof img == "string")
			{
				images[img].src = "";
				delete images[img];
			}
			else
			{
				img.src = "";
			}
		}
		this._libItemsToUnload = this._imagesToUnload = this.config = null;
		if(this._taskMan)
		{
			this._taskMan.off();
			this._taskMan.destroy();
			this._taskMan = null;
		}
		this._activeSyncAudio = this._activeAudio = this._audioAliases = this._audio = null;
		this._loadCallback = this._endCallback = this._clip = this._captionsObj = null;
		if(this.parent)
			this.parent.removeChild(this);
		this.display = null;
	};

	namespace("springroll").Cutscene = Cutscene;
	namespace("springroll.easeljs").Cutscene = Cutscene;
}());
