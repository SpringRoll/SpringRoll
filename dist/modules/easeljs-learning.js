/*! SpringRoll 0.3.1 */
/**
 * @module EaselJS Learning
 * @namespace springroll.easeljs
 * @requires Core, Learning
 */
(function(undefined)
{
	var Application = include('springroll.Application');

	/**
	 *  Fires DwellTime Learning events for clickable objects
	 *  @class DwellTimer
	 *  @constructor
	 *  @param {createjs.DisplayObject} target  Object for which to add dwellTime events
	 *  @param {springroll.Learning} [learning] Learning Dispatcher instance to use
	 */
	var DwellTimer = function(target, learning)
	{
		/**
		 *  Interactable DisplayObject
		 *  @property {createjs.DisplayObject} target
		 */
		this.target = target;

		if (target.name === undefined)
		{
			throw "DwellTimer object target needs a name";
		}

		/**
		 *  name of this timer
		 *  @property {String}
		 */
		this.timer = target.id + "_dwell";

		/**
		 *  Reference to Learning Dispatcher
		 *  @property {springroll.Learning} learning
		 */
		this.learning = learning || Application.instance.learning;

		target.__dwellTimer = this;

		this.mouseOver = this.mouseOver.bind(this);
		this.mouseOut = this.mouseOut.bind(this);

		target.addEventListener("mouseover", this.mouseOver);
	};

	//Extend the container
	var p = DwellTimer.prototype;

	/**
	 *  minimum length of dwell time necessary to fire event
	 *  @property {Number}
	 */
	var MIN_TIME = 1000;

	/**
	 *  start timer on mouseover
	 *  @param {createjs.MouseEvent} ev Mouse Event
	 */
	p.mouseOver = function(ev)
	{
		var target = this.target;
		//Don't fire event if this object is not clickable
		if ((target.enabled !== undefined && !target.enabled) ||
			(!target.hasEventListener("mousedown") &&
				!target.hasEventListener("click") &&
				!target.hasEventListener("mouseup") &&
				!target.hasEventListener("pressup")))
		{
			return;
		}
		if (this.learning)
		{
			this.learning.startTimer(this.timer);
		}
		target.addEventListener("mousedown", this.mouseOut);
		target.addEventListener("mouseout", this.mouseOut);
	};

	/**
	 *  Dwell ended - fire event if dwelled long enough
	 *  @param {createjs.MouseEvent} ev Mouse Event
	 */
	p.mouseOut = function(ev)
	{
		var target = this.target;
		target.removeEventListener("mousedown", this.mouseOut);
		target.removeEventListener("mouseout", this.mouseOut);
		var dwellTime;
		if (this.learning)
		{
			dwellTime = this.learning.stopTimer(this.timer);
			if (dwellTime >= MIN_TIME)
			{
				this.learning.dwellTime(dwellTime, target.name);
			}
		}
	};

	/**
	 *  Remove all listeners and whatnot
	 *  @method destroy
	 */
	p.destroy = function()
	{
		var target = this.target;
		target.removeEventListener("mouseover", this.mouseOver);
		target.removeEventListener("mousedown", this.mouseOut);
		target.removeEventListener("mouseout", this.mouseOut);

		if (this.learning)
		{
			this.learning.removeTimer(this.timer);
			this.learning = null;
		}

		this.target = this.timer = null;
		this.mouseOver = this.mouseOut = null;
	};

	/**
	 *  Setup a DwellTimer for a DisplayObject.
	 *  @param {createjs.DisplayObject} obj Clickable DisplayObject
	 */
	DwellTimer.create = function(obj)
	{
		DwellTimer.destroy(obj);
		new DwellTimer(obj);
	};

	/**
	 *  If exists, cleanup and remove DwellTimer from object
	 *  @param {createjs.DisplayObject} obj DisplayObject with DwellTimer to cleanup
	 */
	DwellTimer.destroy = function(obj)
	{
		if (obj.__dwellTimer)
		{
			obj.__dwellTimer.destroy();
			delete obj.__dwellTimer;
		}
	};

	//Assign to namespace
	namespace('springroll.easeljs').DwellTimer = DwellTimer;
}());
/**
 * @module EaselJS Learning
 * @namespace springroll.easeljs
 * @requires Core, Learning
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin'),
		Point = include('createjs.Point');

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

	// Init the animator
	p.setup = function()
	{
		/**
		 *  Some games need to send additional parameters to the tracker's
		 *  offClick event. They may set them here as needed
		 *  @property {Array} offClickParams
		 */
		this.offClickParams = [];

		/**
		 * For the learning, we want to send consistent data when sending
		 * Position. This helper method will generate that data.
		 * In the future, we may return an object with known properties,
		 * but for now we are returning an object of {x:int, y:int,
		 * stage_width:int, stage_height:int} in unscaled numbers.
		 *
		 * @method normalizePosition
		 * @param {Number|createjs.Point} x The x position, or a point to use.
		 * @param {Number|createjs.DisplayObject} y The y position, or a
		 *	display object in which the position's coordinate space is in.
		 * @param {createjs.DisplayObject} [coordSpace] The coordinate space
		 *	the position is in, so it can be converted to global space.
		 * @return {Object} {x:int, y:int, stage_width:int, stage_height:int}
		 */
		this.normalizePosition = function(x, y, coordSpace)
		{
			if (x instanceof Point)
			{
				coordSpace = y;
				y = x.y;
				x = x.x;
			}
			//TODO: Support Pixi with this as well
			if (coordSpace && coordSpace.localToGlobal)
			{
				var globalPoint = coordSpace.localToGlobal(x, y);
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
			this.learning.offClick.apply(this, arr);
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