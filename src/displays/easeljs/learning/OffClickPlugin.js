/**
 * @module EaselJS Learning
 * @namespace springroll.easeljs
 * @requires Core, Learning
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Point = include('createjs.Point'),
		Debug;

	/**
	 * Create an app plugin EaselJS off click reporting to learning dispatcher
	 * automatically, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class OffClickPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var OffClickPlugin = function()
	{
		ApplicationPlugin.call(this);
	};

	// Reference to the prototype
	var p = extend(OffClickPlugin, ApplicationPlugin);
	
	var helperPoint = new Point();

	// Init the animator
	p.setup = function()
	{
		if (!Debug)
		{
			Debug = include('springroll.Debug', false);
		}

		/**
		 *  Some games need to send additional parameters to the tracker's
		 *  offClick event. They may set them here as needed. These parameters are appended
		 *  to the normal offClick data.
		 *  @property {Array} offClickParams
		 */
		this.offClickParams = [];

		/**
		 * For learning events, we want to send consistent data when sending
		 * positions. This helper method generates that data.
		 * In the future, we may return an object with known properties,
		 * but for now we are returning an object of {x:int, y:int,
		 * stage_width:int, stage_height:int} in unscaled numbers.
		 *
		 * @method normalizePosition
		 * @param {createjs.DisplayObject|createjs.Point} pos A display object or point to use.
		 * @param {createjs.DisplayObject} [coordSpace] The coordinate space the position is in, so
		 *                                              it can be converted to global space. If
		 *                                              omitted and <code>pos</code> is a
		 *                                              DisplayObject, <code>pos.parent</code> will
		 *                                              be used.
		 * @return {Object} {x:int, y:int, stage_width:int, stage_height:int}
		 */
		
		/**
		 * For learning events, we want to send consistent data when sending
		 * positions. This helper method generates that data.
		 * In the future, we may return an object with known properties,
		 * but for now we are returning an object of {x:int, y:int,
		 * stage_width:int, stage_height:int} in unscaled numbers.
		 *
		 * @method normalizePosition
		 * @param {Number} x The x position
		 * @param {Number} y The y position
		 * @param {createjs.DisplayObject} [coordSpace] The coordinate space the position is in, so
		 *                                              it can be converted to global space.
		 * @return {Object} {x:int, y:int, stage_width:int, stage_height:int}
		 */
		this.normalizePosition = function(x, y, coordSpace)
		{
			//detect Points and DisplayObjects
			if (x.hasOwnProperty("x"))
			{
				coordSpace = y || x.parent;
				y = x.y;
				x = x.x;
			}

			if (coordSpace && coordSpace.localToGlobal)
			{
				var globalPoint = coordSpace.localToGlobal(x, y, helperPoint);
				x = globalPoint.x;
				y = globalPoint.y;
			}

			var display = this.display;
			return {
				x: x | 0,
				y: y | 0,
				stage_width: display.width,
				stage_height: display.height
			};
		};

		/**
		 * For learning events, we want to send consistent data when sending
		 * Position. This helper method generates that data for the
		 * current mouse's stage position. We are returning an object of
		 * `{x:int, y:int, stage_width:int, stage_height:int}` in unscaled numbers.
		 *
		 * @method mousePosition
		 * @return {Object} `{x:int, y:int, stage_width:int, stage_height:int}`
		 */
		this.mousePosition = function()
		{
			var stage = this.display.stage;
			return this.normalizePosition(stage.mouseX, stage.mouseY);
		};
	};

	// Check for dependencies
	p.preload = function(done)
	{
		//Provide convenience handling of stage off click progress events
		onStageMouseDown = onStageMouseDown.bind(this);
		if (this.display && this.display.stage)
		{
			this.display.stage.addEventListener("stagemousedown", onStageMouseDown);
		}
		done();
	};

	/**
	 *  Fires OffClick event if click on unhandled object
	 */
	var onStageMouseDown = function(ev)
	{
		//sanity checking to make sure learning exists
		if (!this.learning) return;

		var stage = ev.target;
		var target = stage._getObjectsUnderPoint(ev.stageX, ev.stageY, null, true);

		var foundListener = false;
		
		if(target)
		{
			while (target && target != stage)
			{
				if (target.hasEventListener("mousedown") || target.hasEventListener("click"))
				{
					foundListener = true;
					break;
				}
				target = target.parent;
			}
		}

		if (!foundListener) //no interactive objects found
		{
			//duplicate the array of optional offClick parameters
			var arr = this.offClickParams.slice(0);

			//make sure we are sending the default parameter (position)
			//as the first parameter
			arr.unshift(this.normalizePosition(ev.stageX, ev.stageY));

			//send the entire array of parameters
			if (this.learning.offClick)
			{
				this.learning.offClick.apply(this, arr);
			}
			else if (DEBUG && Debug)
			{
				Debug.info("Learning doesn't have an offClick event");
			}
		}
	};

	// Destroy the animator
	p.teardown = function()
	{
		//Remove stage listener
		if (this.display && this.display.stage)
		{
			this.display.stage.removeEventListener("stagemousedown", onStageMouseDown);
		}
		this.offClickParams = null;
	};

	// register plugin
	ApplicationPlugin.register(OffClickPlugin);

}());