/*! SpringRoll 1.0.3 */
/**
 * @module EaselJS Cutscene
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function()
{
	var Debug,
		Container = include('createjs.Container'),
		Application,
		Sound;

	/**
	 * Cutscene is a class for playing a single EaselJS animation synced to a
	 * single audio file with springroll.Sound, with optional captions.
	 *
	 * @class Cutscene
	 * @extends createjs.Container
	 * @constructor
	 * @param {Object} options The runtime specific setup data for the cutscene.
	 * @param {createjs.Container} options.clip The movieclip animation
	 * @param {int} options.width The width of the animation
	 * @param {int} options.height The height of the animation
	 * @param {String|springroll.AbstractDisplay} options.display The display or display
	 *       id of the EaselJSDisplay to draw on.
	 * @param {Array} options.audio The audio being played
	 * @param {Number} [options.imageScale=1] Scaling to apply to all images loaded for the
	 *     Cutscene.
	 * @param {springroll.Captions} [options.captions] A Captions instance to display captions text on.
	 */
	var Cutscene = function(options)
	{
		if (!Application)
		{
			Debug = include('springroll.Debug', false);
			Application = include('springroll.Application');
			Sound = include('springroll.Sound');
		}

		Container.call(this);

		if (!options)
		{
			throw "Need options to create Cutscene";
		}

		/**
		 * Reference to the display we are drawing on
		 * @property {Display} display
		 * @private
		 */
		var display = this._display = options.display;

		/**
		 * The designed width of the animation
		 * @property {Number} width
		 * @private
		 */
		this.width = options.width;

		/**
		 * The designed height of the animation
		 * @property {Number} height
		 * @private
		 */
		this.height = options.height;

		/**
		 * The time elapsed in seconds.
		 * @property {Number} _elapsedTime
		 * @private
		 */
		this._elapsedTime = 0;

		/**
		 * Time sorted list of audio that needs to be played, as well as information on if they
		 * should be synced or not.
		 * @property {Array} _audio
		 * @private
		 */
		this._audio = options.audio ? options.audio.slice() : [];
		this._audio.sort(audioSorter);

		/**
		 * Index of the sound that is next up in _audio.
		 * @property {int} _audioIndex
		 * @private
		 */
		this._audioIndex = 0;

		/**
		 * The clip that is being animated.
		 * @property {createjs.MovieClip} _clip
		 * @private
		 */
		var clip = this._clip = options.clip;

		/**
		 * The queue of sound instances of playing audio that the animation should be synced to.
		 * Only the most recent active one will be synced to.
		 * @property {Array} _activeSyncAudio
		 * @private
		 */
		this._activeSyncAudio = [];

		/**
		 * The time in seconds into the animation that the current synced audio started.
		 * @property {Number} _soundStartTime
		 * @private
		 */
		this._soundStartTime = -1;

		/**
		 * Array of active SoundInstances that are not the currently synced one.
		 * @property {Array} _activeAudio
		 * @private
		 */
		this._activeAudio = [];

		/**
		 * If the audio has finished playing.
		 * @property {Boolean} _audioFinished
		 * @private
		 */
		this._audioFinished = false;

		/**
		 * The function to call when playback is complete.
		 * @property {Function} _endCallback
		 * @private
		 */
		this._endCallback = null;

		/**
		 * The Captions object to use to manage captions.
		 * @property {Captions} _captions
		 * @private
		 */
		var captions = this._captions = options.captions;

		// Make sure the captions don't update themselves
		if (captions)
		{
			captions.selfUpdate = false;
		}

		// bind some callbacks
		this.update = this.update.bind(this);
		this.resize = this.resize.bind(this);

		// Set some clip defaults
		clip.mouseEnabled = false;
		clip.tickEnabled = false;
		clip.gotoAndPlay(0);
		clip.loop = false;

		// Add the clip to the stage
		this.addChild(clip);

		this.resize(display.width, display.height);

		// Handle the resize of the application
		Application.instance.on("resize", this.resize);
	};

	// Reference to the container
	var p = extend(Cutscene, Container);

	/**
	 * Audio sort based on the start time
	 * @method audioSorter
	 * @private
	 */
	function audioSorter(a, b)
	{
		return a.start - b.start;
	}

	/**
	 * Listener for when the Application is resized.
	 * @method resize
	 * @param {int} width The new width of the display.
	 * @param {int} height The new height of the display.
	 * @private
	 */
	p.resize = function(width, height)
	{
		if (!this._clip) return;

		var designedRatio = this.width / this.height,
			currentRatio = width / height,
			scale;

		if (designedRatio > currentRatio)
		{
			// current ratio is narrower than the designed ratio, scale to width
			scale = width / this.width;
			this.x = 0;
			this.y = (height - this.height * scale) * 0.5;
		}
		else
		{
			scale = height / this.height;
			this.x = (width - this.width * scale) * 0.5;
			this.y = 0;
		}
		this._clip.scaleX = this._clip.scaleY = scale;
	};

	/**
	 * Starts playing the cutscene.
	 * @method start
	 * @param {Function} callback The function to call when playback is complete.
	 */
	p.start = function(callback)
	{
		this._endCallback = callback;

		this._elapsedTime = 0;
		this._animFinished = false;
		this._audioFinished = !this._audio.length;

		for (var i = 0; i < this._audio.length; ++i)
		{
			var data = this._audio[i];
			if (data.start === 0)
			{
				var alias = data.alias;
				var instanceRef = {};
				if (data.sync)
				{
					var audio = Sound.instance.play(
						alias,
						this._audioCallback.bind(this, instanceRef)
					);
					this._activeSyncAudio.unshift(audio);
					instanceRef.instance = audio;
					audio._audioData = data;
					this._soundStartTime = data.start;

					if (this._captions)
					{
						this._captions.play(alias);
					}
				}
				else
				{
					var instance = Sound.instance.play(
						alias,
						this._audioCallback.bind(this, instanceRef)
					);
					instanceRef.instance = instance;
					this._activeAudio.push(instance);
				}
				++this._audioIndex;
			}
			else
			{
				break;
			}
		}
		Application.instance.on("update", this.update);
	};

	/**
	 * Callback for when the audio has finished playing.
	 * @method _audioCallback
	 * @private
	 */
	p._audioCallback = function(instanceRef)
	{
		var index = this._activeSyncAudio.indexOf(instanceRef.instance);

		if (index != -1)
		{
			if (index === 0)
			{
				this._activeSyncAudio.shift();
			}
			else
			{
				this._activeSyncAudio.splice(index, 1);
			}

			if (this._activeSyncAudio.length < 1)
			{
				this._audioFinished = true;
				this._soundStartTime = -1;
				if (this._captions)
				{
					this._captions.stop();
				}
				if (this._animFinished)
				{
					this.stop(true);
				}
			}
			else
			{
				var data = this._activeSyncAudio[0]._audioData;
				this._soundStartTime = data.start;

				if (this._captions)
				{
					this._captions.play(data.alias);
				}
			}
		}
		else
		{
			index = this._activeAudio.indexOf(instanceRef.instance);
			if (index != -1)
			{
				this._activeAudio.splice(index, 1);
			}
		}
	};

	/**
	 * Listener for frame updates.
	 * @method update
	 * @param {int} elapsed Time in milliseconds
	 * @private
	 */
	p.update = function(elapsed)
	{
		if (this._animFinished) return;

		// update the elapsed time first, in case it starts audio
		if (!this._activeSyncAudio.length)
		{
			this._elapsedTime += elapsed * 0.001;
		}

		for (var i = this._audioIndex; i < this._audio.length; ++i)
		{
			var data = this._audio[i];

			if (data.start <= this._elapsedTime)
			{
				var alias = data.alias;
				var instanceRef = {};

				if (data.sync)
				{
					this._audioFinished = false;
					var audio = Sound.instance.play(
						alias,
						this._audioCallback.bind(this, instanceRef)
					);

					this._activeSyncAudio.unshift(audio);
					instanceRef.instance = audio;
					audio._audioData = data;
					//immediately walk back the elapsed time so that we sync to the audio
					//and don't run into a situation where we are playing multiple synced
					//audio that should not be simultaneous
					this._elapsedTime = this._soundStartTime = data.start;

					if (this._captions)
					{
						this._captions.play(alias);
					}
				}
				else
				{
					var instance = Sound.instance.play(alias,
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
			{
				break;
			}
		}

		if (this._activeSyncAudio.length)
		{
			var pos = this._activeSyncAudio[0].position * 0.001;

			// sometimes (at least with the flash plugin), the first check of the
			// position would be very incorrect
			if (this._elapsedTime === 0 && pos > elapsed * 2)
			{
				// do nothing here
			}
			else
			{
				// save the time elapsed
				this._elapsedTime = this._soundStartTime + pos;
			}
		}

		if (this._captions && this._soundStartTime >= 0)
		{
			this._captions.seek(this._activeSyncAudio[0].position);
		}

		if (!this._animFinished)
		{
			// set the elapsed time of the clip
			var clip = (!this._clip.timeline || this._clip.timeline.duration == 1) ?
				this._clip.getChildAt(0) :
				this._clip;

			clip.elapsedTime = this._elapsedTime;
			clip.advance();

			if (clip.currentFrame == clip.timeline.duration)
			{
				this._animFinished = true;
				if (this._audioFinished)
				{
					this.stop(true);
				}
			}
		}
	};

	/**
	 * Stops playback of the cutscene.
	 * @method stop
	 * @param {Boolean} [doCallback=false] If the end callback should be performed.
	 */
	p.stop = function(doCallback)
	{
		Application.instance.off("update", this.update);
		var i;

		for (i = 0; i < this._activeSyncAudio.length; ++i)
		{
			this._activeSyncAudio[i].stop();
		}

		for (i = 0; i < this._activeAudio.length; ++i)
		{
			this._activeAudio[i].stop();
		}
		this._activeAudio.length = this._activeSyncAudio.length = 0;

		if (this._captions)
		{
			this._captions.stop();
		}

		if (doCallback)
		{
			this.dispatchEvent('complete');
			if (this._endCallback)
			{
				this._endCallback();
				this._endCallback = null;
			}
		}
	};

	/**
	 * Destroys the cutscene.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.stop();

		this.dispatchEvent('destroy');

		Application.instance.off("resize", this.resize);

		this.removeAllChildren(true);

		this._activeSyncAudio =
			this._activeAudio =
			this._audio =
			this._display =
			this._endCallback =
			this._clip =
			this._captions = null;

		if (this.parent)
		{
			this.parent.removeChild(this);
		}
		this.removeAllEventListeners();
	};

	namespace("springroll").Cutscene = Cutscene;
	namespace("springroll.easeljs").Cutscene = Cutscene;

}());
/**
 * @module EaselJS Cutscene
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function(window)
{
	var Task = include('springroll.Task'),
		Cutscene = include('springroll.easeljs.Cutscene'),
		Application = include('springroll.Application');

	/**
	 * Loads and instantiates a 'springroll.easeljs.Cutscene'.
	 * @class CutsceneTask
	 * @extends springroll.Task
	 * @constructor
	 * @private
	 * @param {Object} asset The data properties
	 * @param {String|Object} asset.anim The path the animation
	 * @param {String} asset.animClass The name of the animation class
	 * @param {int} asset.width The width of the animation
	 * @param {int} asset.height The height of the animation
	 * @param {Array} [asset.audio] The collection of audio files
	 * @param {Array} [asset.images] The map of the images to load
	 * @param {String} [asset.fps] The animation framerate, defaults to Application framerate
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {String} [asset.libItem='lib'] The global window object for symbols
	 * @param {String} [asset.imagesName='images'] The global window object for images
	 */
	var CutsceneTask = function(asset)
	{
		Task.call(this, asset, asset.animClass);

		// Reference to the application
		var app = Application.instance;

		/**
		 * The path to the flash asset
		 * @property {String|Object} anim
		 */
		this.anim = asset.anim;

		/**
		 * The framerate, defaults to Application framerate
		 * @property {int} fps
		 */
		this.fps = asset.fps || app.options.fps;

		/**
		 * The name of the animation class
		 * @property {String} animClass
		 */
		this.animClass = asset.animClass;

		/**
		 * The designed width of the animation
		 * @property {int} width
		 */
		this.width = asset.width;

		/**
		 * The designed height of the animation
		 * @property {int} height
		 */
		this.height = asset.height;

		/**
		 * The collection of objects with alias, start and sync property
		 * @property {Array} audio
		 */
		this.audio = asset.audio;

		/**
		 * The collection of images to preload, will be cached
		 * @property {Object} images
		 */
		this.images = asset.images;

		/**
		 * The name of the window object library items hang on
		 * @property {String} libName
		 * @default 'lib'
		 */
		this.libName = asset.libName || 'lib';

		/**
		 * The name of the window object images hang on
		 * @property {String} imagesName
		 * @default 'images'
		 */
		this.imagesName = asset.imagesName || 'images';

		/**
		 * The display to use, defaults to main App's main display
		 * @property {springroll.AbstractDisplay} display
		 */
		this.display = typeof asset.display == "string" ?
			app.getDisplay(asset.display) : app.display;
	};

	// Reference to prototype
	var s = Task.prototype;
	var p = Task.extend(CutsceneTask);

	/**
	 * Test if we should run this task
	 * @method test
	 * @static
	 * @param {Object} asset The asset to check
	 * @return {Boolean} If the asset is compatible with this asset
	 */
	CutsceneTask.test = function(asset)
	{
		return !!asset.anim && asset.anim.search(/\.js$/i) > -1 &&
			!!asset.animClass && asset.width && asset.height;
	};

	/**
	 * Start the task
	 * @method  start
	 * @param  {Function} callback Callback when finished
	 */
	p.start = function(callback)
	{
		var assets = {
			_anim:
			{
				src: this.anim,
				libName: this.libName,
				images: this.images,
				imagesName: this.imagesName,
				type: "easeljs",
				format: "springroll.easeljs.FlashArt"
			}
		};

		if (this.audio)
		{
			var aliases = [];
			this.audio.forEach(function(audio)
			{
				aliases.push(audio.alias);
			});

			// The Sound to preload audio aliases
			assets._audio = {
				sounds: aliases
			};
		}

		var app = Application.instance;

		// Preload all the assets for the cutscene
		app.load(assets, function(results)
			{
				// Include the clip class
				var ClipClass = include(this.libName + "." + this.animClass);
				var clip = new ClipClass();
				clip.framerate = this.fps;

				// Create the cutscene object
				var cutscene = new Cutscene(
				{
					clip: clip,
					width: this.width,
					height: this.height,
					display: this.display,
					captions: app.captions || null,
					audio: this.audio
				});

				// Handle the destroying of the cutscene
				// either through implementation or through
				// the cache destroying the Cutscene
				cutscene.addEventListener('destroy', function()
				{
					// Destroy the FlashArt object
					results._anim.destroy();

					// Destroy the audio
					if (results._audio)
					{
						results._audio.destroy();
					}
				});
				callback(cutscene);
			}
			.bind(this));
	};

	/**
	 * Destroy
	 * @method  destroy
	 */
	p.destroy = function()
	{
		this.display = null;
		this.images = null;
		this.audio = null;

		s.destroy.call(this);
	};

	// Assign to namespace
	namespace('springroll.easeljs').CutsceneTask = CutsceneTask;

}(window));
/**
 * @module EaselJS Cutscene
 * @namespace springroll
 * @requires Core, EaselJS Display
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin();

	// Register the tasks
	plugin.setup = function()
	{
		this.assetManager.register('springroll.easeljs.CutsceneTask', 80);
	};

}());