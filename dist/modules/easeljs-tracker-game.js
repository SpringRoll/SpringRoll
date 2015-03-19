/*! SpringRoll 0.2.0 */
/**
 * @module CreateJS Tracker Game
 * @namespace springroll.easeljs
 * @requires Game, Tracker Game, Sound, Tasks, EaselJS Interface, EaselJS Display, EaselJS Animation
 */
(function(undefined)
{
	var Animator = include('springroll.Animator'),
		DwellTimer = include('springroll.easeljs.DwellTimer', false);

	/**
	 *  CreateJS-based asset utilities
	 *  @class AssetUtils
	 *  @static
	 */
	var AssetUtils = {};

	/**
	 *  Rip the asset from the library display container and add it
	 *  to the stage, also will try to stop the clip if it can.
	 *  @method add
	 *  @static
	 *  @param {createjs.Container} target The target display object
	 *  @param {createjs.Container} source The source to get assets from
	 *  @param {string} property The property name of the asset
	 *  @param {boolean} [visible] The set the initial visibility state of the object
	 *  @return {createjs.DisplayObject} Return the display object
	 */
	AssetUtils.add = function(target, source, property, visible)
	{
		var asset = source[property];
		if (!asset)
		{
			if (true && Debug)
			{
				Debug.error("property " + property + " not found in source");
			}
			return;
		}
		//If it's a movieclip stop it
		if (asset.gotoAndStop)
		{
			asset.gotoAndStop(0);
		}
		//Set the initial visible state
		if (visible !== undefined)
		{
			asset.visible = !!visible;
		}

		//Add the child
		target.addChild(asset);

		return asset;
	};

	/**
	 *  Removes a collection of objects from the stage and destroys them if we cant.
	 *  @example AssetUtils.remove(this, this.skipButton, this.character);
	 *  @method remove
	 *  @static
	 *  @param {createjs.Container} target The target display object to remove assets from
	 *  @param {array|*} assets Assets to clean can either be arguments or array
	 */
	AssetUtils.remove = function(target, assets)
	{
		//Start after the target
		var arg, i, j, len = arguments.length;
		for (i = 1; i < len; i++)
		{
			arg = arguments[i];
			if (!arg) continue;

			//test the current argument to see if itself is
			//an array, if it is, run .remove() recursively
			if (Array.isArray(arg) && arg.length > 0)
			{
				for (j = arg.length - 1; j >= 0; --j)
				{
					if (arg[j])
					{
						AssetUtils.remove(target, arg[j]);
					}
				}
				continue;
			}
			
			if(DwellTimer)
				DwellTimer.destroy(arg);

			Animator.stop(arg, true);

			if (arg.stop)
			{
				arg.stop();
			}

			if (arg.destroy)
			{
				arg.destroy();
			}

			if (arg.removeAllChildren)
			{
				arg.removeAllChildren(true);
			}

			if (target.contains(arg))
			{
				target.removeChild(arg);
			}
		}
	};

	/**
	 *  Add an asset or array of assets as children to container
	 *  @param {Array|createjs.DisplayObject} assets Asset or Array of assets
	 *  @param {createjs.DisplayObject} container Display object to add children to
	 */
	AssetUtils.addAssetsToContainer = function(assets, container)
	{
		if (!assets)
			return;

		if (!assets.length)
		{
			container.addChild(assets);
		}
		else
		{
			for (var i = assets.length; i >= 0; i--)
			{
				if (assets[i])
				{
					container.addChild(assets[i]);
				}
			}
		}
	};

	/**
	 *  @param container {createjs.Container|*} Container, clip, etc. to add objects to once found
	 *  @param lib {createjs.Lib} Lib that contians the assets
	 *  @param label {String} Label for assets without number suffix
	 *  @param start {Int} Initial number of asset sequence
	 *  @param count {int} How many counts from starting int
	 *  @param visible {Boolean} Initial visiblity of added asset
	 */
	AssetUtils.getAssetSequence = function(container, lib, label, start, count, visible)
	{
		var arr = [];
		arr.push(null); //1-base array
		for (var i = start, mc = null; i <= count; i++)
		{
			mc = AssetUtils.add(container, lib, label + i, visible);
			mc.id = i;
			arr.push(mc);
		}

		return arr;
	};

	//Assign to namespace
	namespace('springroll.easeljs').AssetUtils = AssetUtils;
}());

/**
 * @module CreateJS Tracker Game
 * @namespace springroll.easeljs
 * @requires Game, Tracker Game, Sound, Tasks, EaselJS Interface, EaselJS Display, EaselJS Animation
 */
(function()
{
	var App = include('springroll.Application');

	/**
	 * Create an update listener that checks plays the animation
	 * in reverse. Requires the animation to have the same labeling
	 * system as the springroll.Animator system.
	 * 	i.e. each animation must have a corresponding ending frame
	 * 	marked with	a '_stop' and '_loop' suffixes,
	 *	for instance: "walk" requires "walk_loop"
	 * @class ReversePlayback
	 * @static
	 * @param {createjs.MovieClip} clip
	 *	The MovieClip containing the timeline and animation
	 */
	var ReversePlayback = function(clip)
	{
		this.clip = clip;
		this.frameRate = 24;

		this.frameDictionary = _buildDictionary(clip);
		this.update = this.update.bind(this);
	};

	var p = ReversePlayback.prototype;

	/**
	 * @param {createjs.MovieClip} clip
	 */
	p.clip = null;

	/**
	 * @param {int} frameRate
	 */
	p.frameRate = null;

	/**
	 * @param {object} frameDictionary
	 */
	p.frameDictionary = null;

	/**
	 * Build a dictionary of all animations start and end
	 * frame positions'
	 * @param {MovieClip} clip
	 */
	var _buildDictionary = function(clip)
	{
		var str, i, label, dict = {};
		for (i = clip._labels.length - 1; i >= 0; i--)
		{
			label = clip._labels[i];
			str = label.label;
			if (str.indexOf('_stop') > -1 || str.indexOf('_loop') > -1)
			{
				continue;
			}

			if (!dict[str])
			{
				dict[str] = {
					first: label.position,
					last: null
				};
			}
		}

		var stop, loop;
		for (i = clip._labels.length - 1; i >= 0; i--)
		{
			label = clip._labels[i];
			str = label.label;
			stop = str.indexOf('_stop');
			loop = str.indexOf('_loop');
			if (loop > -1)
			{
				dict[str.substring(0, loop)].last = label.position;
			}
		}
		return dict;
	};

	/**
	 * Play the specificied animation
	 * @param {string} label
	 */
	p.play = function(label)
	{
		var frame = this.frameDictionary[label];
		this.startFrame = frame.last;
		this.endFrame = frame.first;
		this.framePassed = this.frameRate;
		this.clip.gotoAndStop(this.endFrame);
		App.instance.on('update', this.update);
	};

	/**
	 * Go to the previous frame of the animation
	 */
	p.goToPreviousFrame = function()
	{
		var prevFrame = this.clip.currentFrame - 1;
		if (prevFrame < this.endFrame)
		{
			//loop back to last-frame
			prevFrame = this.startFrame;
		}
		this.clip.gotoAndStop(prevFrame);
	};

	/**
	 * Update the animation when framerate matches animation's framerate
	 * @param {number} elapsed Time in milleseconds since last frame update
	 */
	p.update = function(elapsed)
	{
		this.framePassed -= elapsed;
		if (this.framePassed <= 0)
		{
			this.framePassed = this.frameRate;
			this.goToPreviousFrame();
		}
	};

	/**
	 * End the frame update loop
	 */
	p.stop = function()
	{
		App.instance.off('update', this.update);
	};

	//Assign to namespace
	namespace('pbskids.createjs').ReversePlayback = ReversePlayback;
}());
/**
 * @module CreateJS Tracker Game
 * @namespace springroll.easeljs
 * @requires Game, Tracker Game, Sound, Tasks, EaselJS Interface, EaselJS Display, EaselJS Animation
 */
(function()
{
	var Debug = include('springroll.Debug', false),
		Animator = include('springroll.Animator'),
		BitmapMovieClip = include('createjs.BitmapMovieClip'),
		DwellTimer = include('springroll.easeljs.DwellTimer'),
		ListTask = include('springroll.ListTask'),
		SoundButton = include('springroll.SoundButton'),
		TextureAtlas = include('createjs.TextureAtlas');

	/**
	 *  CreateJS-based sprite utilities
	 *  @class SpriteUtils
	 *  @static
	 */
	var SpriteUtils = {};

	/**
	 *  Create a SoundButton. Must be bound to a springroll.BasePanel
	 *	in order to default to the config.sprites position.
	 * 		i.e. createSoundButon.call(<panel>, arg1...)
	 *  @param {String} [key|Object=String]
	 *		The id for the loaded bitmap in images
	 *		e.g. 'SkipButton' > images.SkipButton
	 *  @param {Object} [options=Object]
	 *  	Pass through any options for SoundButton if
	 * 		they are not to be the defaults
	 *  @return {springroll.SoundButton} button
	 */
	SpriteUtils.createSoundButton = function(key, options)
	{
		options = options || {};

		if (!images[key])
		{
			if (true && Debug) Debug.error('key '+key+' cannot be found in loaded images');
		}
		var soundButton = new SoundButton(
			images[key],
			options.label,
			options.enabled,
			options.clickAlias,
			options.overAlias);

		var camelCaseKey = key.charAt(0).toLowerCase() + key.slice(1);
		var configPos = this.config && this.config.sprites ?
			this.config.sprites[camelCaseKey] :
			null;

		//was an alternate config sent through?
		var pos = options.position ||
			//if not, check the sprites config
			(configPos ? configPos :
				//default to zero
				{
					x: 0,
					y: 0
				});

		//prefer defined options,
		//then check config/options.position,
		soundButton.x = options.x || pos.x;
		soundButton.y = options.x || pos.y;

		//Dwell timer requires a "name" variable
		soundButton.name = key;
		DwellTimer.create(soundButton);

		return soundButton;
	};

	/**
	 *  Clone a sprite. Creates a shallow copy of loaded element
	 *  @method clone
	 *  @param {createjs.BitmapMovieClip} sprite
	 *  @param {int} x
	 *  @param {int} y
	 *  @param return {createjs.BitmapMovieClip}
	 */
	SpriteUtils.clone = function(sprite, x, y)
	{
		var clone = new BitmapMovieClip();
		clone.copyFrom(sprite);
		clone.gotoAndStop(0);
		clone.x = x || 0;
		clone.y = y || 0;
		return clone;
	};

	/**
	 *  Add task for all sprites in the spritesRequest object
	 *  @param {object} spritesRequest Config data for the sprites
	 *								   needed in this state
	 *  @param {springroll.BasePanel} panel The panel for this state
	 *  @param {array} tasks The list of task to preload
	 *  @param {string} path The path to the folder containing
	 *						 the 'full' and 'half' sprite folders
	 */
	SpriteUtils.addSpritesRequest = function(spritesRequest, panel, tasks, path)
	{
		var isSmallScreen = window.IS_SMALL_SCREEN ||
			panel.game.display.width <= 350;

		path = path || 'assets/sprites/';
		var label, req, dir;
		for (var i = spritesRequest.length - 1; i >= 0; i--)
		{
			label = req = null;
			req = spritesRequest[i];
			if (panel.game.isMobile && req.mobile === false)
			{
				continue;
			}

			label = (typeof req === 'string') ? req : req.id;


			//Does the sprite have a half = true parameter?
			//Use the path to
			dir = path + (isSmallScreen && req.hasHalf ? 'half/' : 'full/');
			tasks.push(new ListTask(
				label,
				SpriteUtils.generateManifest(label, dir),
				SpriteUtils.onSpriteLoaded.bind(panel)));
		}
	};

	/**
	 *  Generate a manifest based on the sprite label
	 *  and an optional path
	 *
	 *  @method generateManifest
	 *  @param {string} label
	 * 	@parma {string} [path='assets/sprites/']
	 */
	SpriteUtils.generateManifest = function(label, path)
	{
		if (path === undefined)
		{
			path = "assets/sprites/";
		}
		return [
		{
			'id': 'animData',
			'src': path + label + '.json'
		},
		{
			'id': 'atlasData',
			'src': path + label + 'Sprite.json'
		},
		{
			'id': 'atlasImage',
			'src': path + label + 'Sprite.png'
		}];
	};

	/**
	 *  Get an array with all the animations that can be called
	 *  within a sprite
	 *  @method extractLabels
	 *  @param {BitmapMovieClip} sprite
	 */
	SpriteUtils.extractLabels = function(sprite)
	{
		var arrLabels = sprite._labels,
			arrReturn = [],
			label = null;
		for (var i = arrLabels.length - 1; i >= 0; i--)
		{
			//Exclude animation-end tags
			label = arrLabels[i].label;
			if (label.indexOf('_loop') === -1 &&
				label.indexOf('_stop') === -1)
			{
				arrReturn.push(label);
			}
		}
		if (arrReturn.length === 0)
		{
			if (true && Debug) Debug.error("Problem finding labels in " + sprite);
		}
		return arrReturn;
	};

	/**
	 *  Clone and setup the sprites for all the characters/opponents.
	 *  @method cloneSpritePerLabel
	 *  @param {BitmapMovieClip} sprite
	 *  @param {createjs.Container} container
	 */
	SpriteUtils.cloneSpritePerLabel = function(sprite, container)
	{
		var arrLabels = SpriteUtils.extractLabels(sprite),
			returnObj = {},
			label = null,
			clone = null;
		for (var i = arrLabels.length - 1; i >= 0; --i)
		{
			label = arrLabels[i];
			clone = SpriteUtils.clone(sprite);
			clone.label = label;
			returnObj[label] = clone;
		}
		return returnObj;
	};

	/**
	 *  LoadTask callback
	 *  Adds a sprite to the sprites container object
	 *  with a key determined by the task's id
	 *  @method onSpriteLoaded
	 *  @param {object} results The object containing the LoadResult objects
	 *  @param {springroll.Task} task The task manager original task
	 */
	SpriteUtils.onSpriteLoaded = function(results, task)
	{
		var sprite = new BitmapMovieClip(
			new TextureAtlas(
				results.atlasImage.content,
				results.atlasData.content
			),
			results.animData.content
		);

		var spritesConfig = this.game.config.sprites;
		if (spritesConfig && spritesConfig[task.id])
		{
			sprite.x = spritesConfig[task.id].x;
			sprite.y = spritesConfig[task.id].y;
		}
		sprite.gotoAndStop(0);
		var label = task.id.charAt(0).toLowerCase() + task.id.slice(1);
		this[label] = sprite;
	};

	/**
	 *  Add an object of clones to a specified container,
	 *  @method addClonesTo
	 *  @param {Array} clones
	 *  @param {createjs.Container} container
	 */
	SpriteUtils.addClonesTo = function(clones, container, hasDefaultAnim)
	{
		var clone;
		for (var key in clones)
		{
			clone = clones[key];
			SpriteUtils.addCloneTo(clone, container, hasDefaultAnim);
		}
	};

	/**
	 *  Add the clone to specified container, and initiailize its
	 *  Animation to a default label, or stop at first frame
	 *  @method addCloneTo
	 *  @param clone
	 *  @param container
	 *  @param hasDefaultAnim
	 */
	SpriteUtils.addCloneTo = function(clone, container, hasDefaultAnim)
	{
		if (hasDefaultAnim)
		{
			Animator.play(clone, clone.label);
		}
		else if (clone.label)
		{
			clone.gotoAndStop(clone.label);
		}
		else
		{
			clone.gotoAndStop(0);
		}
		container.addChild(clone);
	};

	/**
	 *  Calculate frame counts for each animation in a Sprite.
	 *  Relies on standard '_stop' or '_loop' ending
	 *  conventions to determine lengths. Those without
	 *  the default ending will default to a length of 0.
	 *  @method calculateAnimationLengths
	 *  @param {springroll.BitmapMovieClip} sprite
	 */
	SpriteUtils.calculateAnimationLengths = function(sprite)
	{
		var positions = {},
			arrLabels = sprite._labels,
			labelObj = null,
			frameCounts = {},
			label = null;
		for (var i = arrLabels.length - 1; i >= 0; i--)
		{
			labelObj = arrLabels[i];
			label = labelObj.label;

			positions[label] = labelObj.position;
			if (label.indexOf('_stop') == -1 &&
				label.indexOf('_loop') == -1)
			{
				frameCounts[label] = 1;
			}
		}

		var start = null;
		for (var k in frameCounts)
		{
			start = positions[k];
			frameCounts[k] =
				positions[k + '_stop'] - start ||
				positions[k + '_loop'] - start ||
				0;
		}
		return frameCounts;
	};

	//Assign to namespace
	namespace('springroll.easeljs').SpriteUtils = SpriteUtils;
}());

/**
 * @module CreateJS Tracker Game
 * @namespace springroll.easeljs
 * @requires Game, Tracker Game, Sound, Tasks, EaselJS Interface, EaselJS Display, EaselJS Animation
 */
(function()
{
	//Import classes
	var Container = include('createjs.Container'),
		AssetUtils,
		Application;

	/**
	 *  Panel with convenience properties to the config, background and game.
	 *  @class BasePanel
	 *  @extend createjs.Container
	 *  @constructor
	 */
	var BasePanel = function()
	{
		if (!Application)
		{
			Application = include('springroll.Application');
			AssetUtils = include('springroll.easeljs.AssetUtils');
		}

		Container.call(this);

		/**
		 *  Reference to the game
		 *  @property {Application} game
		 */
		this.game = Application.instance;

		/**
		 *  Reference to the app's config
		 *  @property {object} config
		 */
		this.config = this.game.config;

		/**
		 *  All panel should probably have a background image
		 *  @property {createjs.Bitmap} background
		 */
		this.background = null;
	};

	//Extend the container
	var p = extend(BasePanel, Container);

	/**
	 *  Should be called whenever a state enters this panel, Implementation-specific
	 *  @method setup
	 */
	p.setup = function()
	{
		//Implementation specific
	};

	/**
	 *  Should be called whenever a state exits this panel, Implementation-specific
	 *  @method setup
	 */
	p.teardown = function()
	{
		//Implementation specific
	};

	/**
	 *  Destroy and don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this.game = null;
		this.config = null;
		this.background = null;

		this.removeAllChildren();
	};

	//Assign to namespace
	namespace('springroll.createjs').BasePanel = BasePanel;
}());
/**
 * @module CreateJS Tracker Game
 * @namespace springroll.easeljs
 * @requires Game, Tracker Game, Sound, Tasks, EaselJS Interface, EaselJS Display, EaselJS Animation
 */
(function(undefined)
{
	var State = include('springroll.BaseState'),
		Debug = include('springroll.Debug', false),
		Application,
		ListTask,
		BasePanel,
		TaskManager,
		UIScaler;

	/**
	 *  Abstract game state class to do some preloading of assets
	 *  also plays well with the game audio loading.
	 *  @class BaseState
	 *  @extends springroll.BaseState
	 *  @constructor
	 *  @param {createjs.Container} panel The panel
	 *  @param {string|function} [nextState=null] The next state alias or call to next state
	 *  @param {string|function} [prevState=null] The previous state alias or call to previous state
	 */
	var BaseState = function(panel, nextState, prevState)
	{
		if (!Application)
		{
			Application = include('springroll.Application');
			BasePanel = include('springroll.easeljs.BasePanel');
			ListTask = include('springroll.ListTask');
			TaskManager = include('springroll.TaskManager');
			UIScaler = include('springroll.UIScaler');
		}

		if (!(panel instanceof BasePanel))
		{
			throw "springroll.BaseState requires the panel be a springroll.easeljs.BasePanel";
		}

		State.call(this, panel, nextState, prevState);

		/**
		 *  Reference to the main game
		 *  @property {_namespace_.State} game
		 *  @protected
		 */
		this.game = Application.instance;

		/**
		 *  The instance of the VOPlayer
		 *  @property {springroll.VOPlayer} player
		 *  @protected
		 */
		this.player = this.game.player;

		/**
		 *  Reference to the main config object
		 *  @property {object} config
		 *  @protected
		 */
		this.config = this.game.config;

		/**
		 *  The assets to load each time
		 *  @property {object} manifset
		 *  @protected
		 */
		this.manifest = null;

		/**
		 *  If the assets have finished loading
		 *  @property {boolean} assetsLoaded
		 *  @protected
		 */
		this.assetsLoaded = false;

		/**
		 *  The UI Scaler object
		 *  @property {springroll.UIScaler} scaler
		 */
		this.scaler = null;

		/**
		 *  Should we attempt to run resize every time this state is entered
		 *  Setting this to false in your subclass before onLoaded is called
		 *  stops assets already on stage from re-scaling
		 *  @property {Boolean}
		 *  @default true
		 *  @protected
		 */
		this.resizeOnReload = true;
	};

	//Reference to the parent prototype
	var s = State.prototype;

	//Reference to current prototype
	var p = extend(BaseState, State);

	/**
	 * Enter the state, when the panel is fully hidden
	 * by the transition
	 * @method enter
	 */
	p.enter = function()
	{
		//Start prealoading assets
		this.loadingStart();

		//Boolean to see if we've preloaded assests
		this.assetsLoaded = false;

		var tasks = [];

		//Preload the manifest files
		if (this.manifest.length)
		{
			tasks.push(new ListTask('manifests', this.manifest, onManifestLoaded));
		}

		this.addTasks(tasks);

		//Start loading assets if we have some
		if (tasks.length)
		{
			TaskManager.process(tasks, onLoaded.bind(this));
		}
		//No files to load, just continue
		else
		{
			onLoaded.call(this);
		}
	};

	/**
	 *  Implementation specific for override. When you need to add additional preload
	 *  tasks to your state, override this function.
	 *  @method addTasks
	 *  @protected
	 *  @param {array} tasks The list of preload tasks
	 */
	p.addTasks = function(tasks)
	{
		//Implementation specific
	};

	/**
	 *  Implementation specific for override. When all the assets have been loaded
	 *  can possible add options for loading assets.
	 *  from the TaskManager.
	 *  @method onAssetsLoaded
	 *  @protected
	 */
	p.onAssetsLoaded = function()
	{
		//Implementation specific
	};

	/**
	 *  The internal call for on assets loaded
	 *  @method onLoaded
	 *  @private
	 */
	var onLoaded = function()
	{
		this.assetsLoaded = true;

		this.panel.setup();

		var scalingConfig = this.config.scaling[this.stateId];

		if (scalingConfig !== undefined)
		{
			if (!this.scaler || this.resizeOnReload)
			{
				this.scaler = new UIScaler(
					this.panel,
					this.config.designedSettings,
					scalingConfig,
					false
				);
			}
		}
		else
		{
			if (true && Debug) Debug.warn("%cThe scaling config for state %c" + this.stateId + " %cis missing!", 'color:orange', 'color:blue', 'color:orange');
		}

		//Background is optional, so we'll check
		//before adding to the scaler
		var background = this.panel.background;
		if (background && background.image)
		{
			this.scaler.addBackground(background);
		}

		//Activate the scaler
		this.scaler.enabled = true;

		this.onAssetsLoaded();
		this.loadingDone();
	};

	/**
	 *  Handler for manifest load task
	 *  @method onManifestLoaded
	 *  @private
	 *  @param {springroll.LoaderResult} results The media loader results (dictionary by task id)
	 *  @param {springroll.Task} task The task reference
	 *  @param {springroll.TaskManager} taskManager The task manager reference
	 */
	var onManifestLoaded = function(results)
	{
		for (var id in results)
		{
			//if it is a javascript file, just leave it alone
			if (results[id].url.indexOf(".js") === -1)
			{
				images[id] = results[id].content;
			}
		}
	};

	/**
	 *  When we exit the state
	 *  @method exit
	 */
	p.exit = function()
	{
		if (!this.assetsLoaded) return;

		this.panel.teardown();

		if (this.scaler)
		{
			this.scaler.enabled = false;
			this.scaler.removeBackground(this.panel.background);

			if (this.resizeOnReload)
			{
				this.scaler.destroy();
				this.scaler = null;
			}
		}

		//Clean any assets loaded by the manifest
		if (this.manifest)
		{
			var id;
			var manifest = this.manifest;
			var len = manifest.length;

			for (var i = 0; i < len; i++)
			{
				id = manifest[i].id;
				delete images[id];
			}
		}
		this.assetsLoaded = false;
	};

	/**
	 *  Don't use after calling this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this.manifest = null;
		this.game = null;
		this.config = null;
		this.player = null;
		this.panel.destroy();

		if (this.scaler)
		{
			this.scaler.destroy();
			this.scaler = null;
		}

		s.destroy.apply(this);
	};

	// Assign to the namespace
	namespace('springroll.createjs').BaseState = BaseState;

	// Deprecated old namespace
	namespace('springroll.createjs').ManifestState = BaseState;
}());
/**
 * @module CreateJS Tracker Game
 * @namespace springroll.easeljs
 * @requires Game, Tracker Game, Sound, Tasks, EaselJS Interface, EaselJS Display, EaselJS Animation
 */
(function(undefined)
{
	//Import classes
	var BaseTrackerGame = include('springroll.TrackerGame'),
		EaselJSDisplay = include('springroll.easeljs.EaselJSDisplay'),
		Animator,
		Text,
		LoadTask,
		BaseState;

	/**
	 *  A createjs-based Game to load manifests
	 *  @class TrackerGame
	 *  @extends springroll.TrackerGame
	 *  @constructor
	 *  @param {object} [options] The Application options
	 *  @param {string} [options.manifestsPath='assets/config/manifests.json']
	 *		The path to the concatinated FLA exported manifests. It's useful
	 *		to load all the manifests at once. This JSON object contains a
	 *		dictionary of state alias and contains an array of manifest assets
	 *		(e.g. `{"id": "PlayButton", "src": "assets/images/button.png"}`.
	 *      Set to null and no manifest will be auto-loaded.
	 *  @param {int} [options.fps=30] The framerate to use for the main display
	 *  @param {function} [options.display=springroll.easeljsDisplay] The 
	 *      display class to use as the default display.
	 *  @param {boolean} [options.displayOptions.clearView=true] If the stage view
	 *      should be cleared everytime in CreateJS stage. 
	 */
	var TrackerGame = function(options)
	{
		Text = include('createjs.Text');
		LoadTask = include('springroll.LoadTask');
		BaseState = include('springroll.easeljs.BaseState');
		Animator = include('springroll.easeljs.Animator');

		BaseTrackerGame.call(this, Object.merge({
			manifestsPath: "assets/config/manifests.json",
			display: EaselJSDisplay,
			displayOptions:	{
				clearView: true,
			},
			fps: 30
		}, options));

		/**
		 *  The collection of loading assests by state
		 *  @property {object} _manifests
		 *  @private
		 */
		this._manifests = {};

		/**
		 *  Some games need to send additional parameters to the tracker's
		 *  offClick event. They may set them here as needed
		 *  @property {Array} offClickParams
		 */
		this.offClickParams = [];

		//Ignore the additional task if we turn off manifests
		if (this.options.manifestsPath !== null)
		{
			addTasks = addTasks.bind(this);
			this.on('loading', addTasks);
		}

		//Add a captions text field after the states are ready
		this.on('statesReady', fixDisplayList.bind(this));

		//Provide convenience handling of stage off click progress events
		onStageMouseDown = onStageMouseDown.bind(this);
		if (this.display && this.display.stage)
		{
			this.display.stage.addEventListener("stagemousedown", onStageMouseDown);
		}
	};

	//Extend base game class
	var s = BaseTrackerGame.prototype;
	var p = extend(TrackerGame, BaseTrackerGame);

	/**
	 *  Event when the manifest is finished loading
	 *  @event manifestLoaded
	 */
	var MANIFEST_LOADED = 'manifestLoaded';

	/**
	 *  Callback to add more custom tasks
	 *  @method addTasks
	 *  @private
	 *  @param {array} tasks The collection of preload tasks
	 */
	var addTasks = function(tasks)
	{
		this.off('loading', addTasks);

		tasks.push(new LoadTask(
			"manifests",
			this.options.manifestsPath,
			onManifestsLoaded.bind(this)));
	};

	/**
	 * Add the text field to the top of the display list
	 * @method fixDisplayList
	 * @private
	 */
	var fixDisplayList = function()
	{
		var stage = this.display.stage;

		//Put the captions on top
		if (this.captions.textField instanceof Text)
		{
			stage.addChild(this.captions.textField);
		}

		//Put the transition back on top
		stage.addChild(this.transition);
	};

	/**
	 *  Callback to when manifests have been loaded
	 *  @method onManifestsLoaded
	 *  @private
	 *  @param {array} tasks The collection of preload tasks
	 */
	var onManifestsLoaded = function(result, task, manager)
	{
		var lowerKey,
			manifest = this._manifests,
			content = result.content;
		for (var key in content)
		{
			lowerKey = key.toString().toLowerCase();
			if (!manifest[lowerKey])
			{
				manifest[lowerKey] = content[key];
			}
		}
		this.trigger(MANIFEST_LOADED, manager);
	};

	/**
	 *  Extend the addState method to at a manifest array to each state
	 *  this will combine manifests from the external file as well any
	 *  manifests that are loaded in the default config.json "manifest" object.
	 *  @method addState
	 *  @param {string} alias The state alias
	 *  @param {BaseState} state The state to add
	 */
	p.addState = function(alias, state)
	{
		if (!(state instanceof BaseState))
		{
			throw "springroll.easeljs.Game requires states to extend springroll.easeljs.BaseState";
		}

		s.addState.call(this, alias, state);

		var manifest = [];

		//Add any manifests from the config
		var configManifests = this.config.manifests;
		if (configManifests !== undefined && configManifests[alias] !== undefined)
		{
			manifest = configManifests[alias];
		}
		//Add any manifest items from the createjs manifest concat
		if (this._manifests[alias] !== undefined)
		{
			manifest = manifest.concat(this._manifests[alias]);
		}
		//Set the properties to the state
		state.manifest = manifest;
	};

	/**
	 *  Fires OffClick event if click on unhandled object
	 *  @method onStageMouseDown
	 *  @private
	 *  @param {MouseEvent} ev stagemousedown event
	 */
	var onStageMouseDown = function(ev)
	{
		//sanity checking to make sure tracker exists
		if (!this.tracker) return;

		var stage = ev.target;
		var target = stage._getObjectsUnderPoint(ev.stageX, ev.stageY, null, true);
		
		if (!target)//no interactive objects found
		{
			//duplicate the array of optional offClick parameters
			var arr = this.offClickParams.slice(0);

			//make sure we are sending the default parameter (position)
			//as the first parameter
			arr.unshift(this.normalizePosition(ev.stageX, ev.stageY));

			//send the entire array of parameters
			this.tracker.offClick.apply(this, arr);
		}
	};

	/**
	 *  Destroy this game, don't use after this
	 *  @method destroy
	 */
	p.destroy = function()
	{
		//Remove stage listener
		if (this.display && this.display.stage)
		{
			this.display.stage.removeEventListener("stagemousedown", onStageMouseDown);
		}

		this.offClickParams = null;
		this._manifests = null;

		s.destroy.call(this);
	};

	/**
	 *  Read-only getter to return _manifests
	 *  @property {object} manifests
	 *  @readOnly
	 */
	Object.defineProperty(p, "manifests",
	{
		get: function()
		{
			return this._manifests;
		}
	});

	//Assign to namespace
	namespace('springroll.easeljs').TrackerGame = TrackerGame;

}());