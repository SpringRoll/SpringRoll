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
	 * Replaces Bitmaps in the global lib dictionary with a faux Bitmap
	 * that pulls the image from a spritesheet.
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
	 * @param {Object} [asset.images] The map of the images to load
	 * @param {String} [asset.fps] The animation framerate, defaults to Application framerate
	 * @param {Boolean} [asset.cache=false] If we should cache the result
	 * @param {String} [asset.id] Id of asset
	 * @param {Function} [asset.complete] The event to call when done
	 * @param {String} [asset.libItem='lib'] The global window object for symbols
	 * @param {String} [asset.imagesName='images'] The global window object for images
	 * @param {Number} [asset.imageScale=1] The default scale of the images
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
		 * The scale of the images
		 * @property {Number} imageScale
		 * @default 1
		 */
		this.imageScale = asset.imageScale || 1;

		/**
		 * The display to use, defaults to main App's main display
		 * @property {springroll.AbstractDisplay} display
		 */
		this.display = typeof asset.display == "string" ?
			app.getDisplay(asset.display) : app.display;
	};

	// Reference to prototype
	var s = Task.prototype;
	var p = extend(CutsceneTask, Task);

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
			_anim : {
				src: this.anim,
				libName: this.libName
			}
		};

		if (this.images)
		{
			// ListTask to load the images
			assets._images = { assets: this.images };
		}

		if (this.audio)
		{
			var aliases = [];
			this.audio.forEach(function(audio)
			{
				aliases.push(audio.alias);
			});

			// The Sound to preload audio aliases
			assets._audio = { sounds: aliases };
		}

		var app = Application.instance;

		// Preload all the assets for the cutscene
		app.load(assets, function(results)
		{
			// Map the images to the global images object
			if (results._images)
			{
				var images = namespace(this.imagesName);
				for (var id in results._images)
				{
					images[id] = results._images[id];
				}
			}

			// Include the clip class
			var ClipClass = include(this.libName + "." + this.animClass);
			var clip = new ClipClass();
			clip.framerate = this.fps;

			// Create the cutscene object
			var cutscene = new Cutscene({
				clip: clip,
				width: this.width,
				height: this.height,
				display: this.display,
				captions: app.captions || null,
				imageScale: this.imageScale,
				audio: this.audio
			});

			// Handle the destroying of the cutscene
			// either through implementation or through
			// the cache destroying the Cutscene
			cutscene.addEventListener('destroy', function()
			{
				// Destroy the FlashArt object
				results._anim.destroy();

				// Destroy the images
				if (results._images)
				{
					var images = namespace(this.imagesName);
					for (var id in results._images)
					{
						images[id].src = "";
						delete images[id];
					}
				}
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