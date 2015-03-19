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