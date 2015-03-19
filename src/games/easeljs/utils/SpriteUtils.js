/**
 * @module EaselJS Tracking Game
 * @namespace springroll.easeljs
 * @requires Core, Game, Tracking Game, Sound, Tasks, EaselJS Interface, EaselJS Display, EaselJS Animation
 */
(function()
{
	var Debug = include('springroll.Debug', false),
		Animator = include('springroll.Animator'),
		BitmapMovieClip = include('springroll.easeljs.BitmapMovieClip'),
		DwellTimer = include('springroll.easeljs.DwellTimer', false),
		ListTask = include('springroll.ListTask'),
		SoundButton = include('springroll.SoundButton'),
		TextureAtlas = include('createjs.TextureAtlas');

	/**
	 *  EaselJS-based sprite utilities for creating and managing sprites,
	 *  and sprite loading.
	 *  @class SpriteUtils
	 *  @static
	 */
	var SpriteUtils = {};

	/**
	 *  Create a SoundButton. Must be bound to a springroll.BasePanel
	 *	in order to default to the config.sprites position.
	 * 		i.e. createSoundButon.call(<panel>, arg1...)
	 * 	@method  createSoundButton
	 *  @static
	 *  @param {String} [key|Object=String]
	 *		The id for the loaded bitmap in images
	 *		e.g. 'SkipButton' > images.SkipButton
	 *  @param {Object} [options=Object]
	 *  	Pass through any options for SoundButton if
	 * 		they are not to be the defaults
	 *  @return {springroll.SoundButton} The new Sound button
	 */
	SpriteUtils.createSoundButton = function(key, options)
	{
		options = options || {};

		if (DEBUG && Debug && !images[key])
		{
			Debug.error('key '+key+' cannot be found in loaded images');
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
		if (DwellTimer) DwellTimer.create(soundButton);

		return soundButton;
	};

	/**
	 *  Clone a sprite. Creates a shallow copy of loaded element
	 *  @method clone
	 *  @static
	 *  @param {springroll.easeljs.BitmapMovieClip} sprite The sprite to clone
	 *  @param {Number} [x=0] The initial x position
	 *  @param {Number} [y=0] The initial y position
	 *  @return {springroll.easeljs.BitmapMovieClip}
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
	 *  @method addSpritesRequest
	 *  @static
	 *  @param {object} spritesRequest Config data for the sprites
	 *								   needed in this state
	 *  @param {springroll.BasePanel} panel The panel for this state
	 *  @param {array} tasks The list of task to preload
	 *  @param {string} path The path to the folder containing
	 *						 the 'full' and 'half' sprite folders
	 */
	SpriteUtils.addSpritesRequest = function(spritesRequest, panel, tasks, path)
	{
		// DEPRECATED the use of the global window var IS_SMALL_SCREEN
		// var isSmallScreen = window.IS_SMALL_SCREEN ||
			// panel.game.display.width <= 350;
		var isSmallScreen = panel.game.display.width <= 350;

		path = path || 'assets/sprites/';
		var label, req, dir;
		for (var i = spritesRequest.length - 1; i >= 0; i--)
		{
			label = req = null;
			req = spritesRequest[i];
			
			if (panel.game.hasTouch && req.mobile === false)
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
	 *  @static
	 *  @param {string} label
	 * 	@param {string} [path='assets/sprites/']
	 * 	@return {Array} The manifest to be loaded
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
			}
		];
	};

	/**
	 *  Clone and setup the sprites for all the characters/opponents.
	 *  @method cloneSpritePerLabel
	 *  @static
	 *  @param {springroll.easeljs.BitmapMovieClip} sprite
	 *  @param {createjs.Container} container
	 *  @return {object} A map of clones by label
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
	 *  @static
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
	 *  @static
	 *  @param {createjs.MovieClip} clone
	 *  @param {createjs.Container} container
	 *  @param {Boolean} [hasDefaultAnim=false]
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

	//Assign to namespace
	namespace('springroll.easeljs').SpriteUtils = SpriteUtils;
	
}());
