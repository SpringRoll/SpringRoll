/**
*  @module CreateJS Display
*  @namespace cloudkid.createjs
*/
(function(undefined){

	// Import createjs classes
	var AbstractDisplay = include('cloudkid.AbstractDisplay'),
		Stage,
		Touch;

	/**
	*   CreateJSDisplay is a display plugin for the CloudKid Framework 
	*	that uses the EaselJS library for rendering.
	*
	*   @class CreateJSDisplay
	*   @extends cloudkid.AbstractDisplay
	*	@constructor
	*	@param {String} id The id of the canvas element on the page to draw to.
	*	@param {Object} options The setup data for the CreateJS stage.
	*	@param {String} [options.stageType="stage"] If the stage should be a normal stage or a SpriteStage (use "spriteStage").
	*	@param {Boolean} [options.clearView=false] If the stage should wipe the canvas between renders.
	*	@param {int} [options.mouseOverRate=30] How many times per second to check for mouseovers. To disable them, use 0 or -1.
	*/
	var CreateJSDisplay = function(id, options)
	{
		if (!Stage)
		{
			Stage = include('createjs.Stage');
			Touch = include('createjs.Touch');
		}

		AbstractDisplay.call(this, id, options);

		options = options || {};

		/**
		*  The rate at which EaselJS calculates mouseover events, in times/second.
		*  @property {int} mouseOverRate
		*  @public
		*  @default 30
		*/
		this.mouseOverRate = options.mouseOverRate || 30;

		if (options.stageType == "spriteStage")
		{
			//TODO: make a sprite stage (not officially released yet)
			// this.stage = new SpriteStage(id);
		}
		else
		{
			/**
			*  The rendering library's stage element, the root display object
			*  @property {createjs.Stage|createjs.SpriteStage} stage
			*  @readOnly
			*  @public
			*/
			this.stage = new Stage(id);
		}
		this.stage.autoClear = !!options.clearView;

		this.animator = include('cloudkid.createjs.Animator');
		this.adapter = include('cloudkid.createjs.DisplayAdapter');
	};

	var s = AbstractDisplay.prototype;
	var p = CreateJSDisplay.prototype = Object.create(s);

	/**
	*  If input is enabled on the stage for this display. The default is true.
	*  @property {Boolean} enabled
	*  @public
	*/
	Object.defineProperty(p, "enabled", {
		get: function(){ return this._enabled; },
		set: function(value)
		{
			Object.getOwnPropertyDescriptor(s, 'enabled').set.call(this, value);

			if(value)
			{
				this.stage.enableMouseOver(this.mouseOverRate);
				this.stage.enableDOMEvents(true);
				Touch.enable(this.stage);
			}
			else
			{
				this.stage.enableMouseOver(false);
				this.stage.enableDOMEvents(false);
				Touch.disable(this.stage);
				this.canvas.style.cursor = "";//reset the cursor
			}
		}
	});

	/** 
	* Updates the stage and draws it. This is only called by the Application. 
	* This method does nothing if paused is true or visible is false.
	* @method render
	* @internal
	* @param {int} elapsed The time elapsed since the previous frame.
	*/
	p.render = function(elapsed)
	{
		if (!this.paused && this._visible)
		{
			this.stage.update(elapsed);
		}		
	};

	/**
	*  Destroys the display. This method is called by the Application and should 
	*  not be called directly, use Application.removeDisplay(id). 
	*  The stage recursively removes all display objects here.
	*  @method destroy
	*  @internal
	*/
	p.destroy = function()
	{
		s.destroy.call(this);

		this.stage.removeAllChildren(true);
		this.stage = null;
	};

	// Assign to the global namespace
	namespace('cloudkid').CreateJSDisplay = CreateJSDisplay;
	namespace('cloudkid.createjs').CreateJSDisplay = CreateJSDisplay;

}());