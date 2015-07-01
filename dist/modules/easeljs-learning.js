/*! SpringRoll 0.3.7 */
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
	 *  @method create
	 *  @static
	 *  @param {createjs.DisplayObject} obj Clickable DisplayObject
	 */
	DwellTimer.create = function(obj)
	{
		DwellTimer.destroy(obj);
		new DwellTimer(obj);
	};

	/**
	 *  If exists, cleanup and remove DwellTimer from object
	 *  @method destroy
	 *  @static
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
	var Point = include('createjs.Point'),
		Debug;

	/**
	 * Create an app plugin EaselJS off click reporting to learning dispatcher
	 * automatically, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class OffClickPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = mixin({}, 'springroll.ApplicationPlugin');

	/**
	 * The last interactive position
	 * @property {createjs.Point} _currentPosition
	 * @private
	 */
	var _currentPosition = new Point();

	/**
	 * Helper point for normalizing position
	 * @property {createjs.Point} _helperPoint
	 * @private
	 */
	var _helperPoint = new Point();
		
	// Init the animator
	plugin.setup = function()
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
		 *  Keep track of the last Pointer ID
		 *  @property {int} _lastPointerID
		 *  @private
		 */
		this._lastPointerID = null;

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
				var globalPoint = coordSpace.localToGlobal(x, y, _helperPoint);
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
		 * current stage position of mouse or touch. We are returning an object of
		 * `{x:int, y:int, stage_width:int, stage_height:int}` in unscaled numbers.
		 *
		 * @method currentPosition
		 * @return {Object} `{x:int, y:int, stage_width:int, stage_height:int}`
		 */
		this.currentPosition = function()
		{
			return this.normalizePosition(_currentPosition);
		};
	};

	// Check for dependencies
	plugin.preload = function(done)
	{
		if (!this.learning)
		{
			if (true)
			{
				throw "Missing learning module. Is a requirement of easeljs-learning";
			}
			else
			{
				throw "No learning";
			}
		}

		//Provide convenience handling of stage off click progress events
		var display = this.display;
		if (display)
		{
			var stage = display.stage;
			if (stage)
			{
				onStageMouseDown = onStageMouseDown.bind(this);
				onStageMouseMove = onStageMouseMove.bind(this);
				stage.addEventListener("stagemousedown", onStageMouseDown);
				stage.addEventListener("stagemousemove", onStageMouseMove);
			}
		}
		done();
	};

	/**
	 *  Fires event whenever the mouse is moved
	 */
	var onStageMouseMove = function(ev)
	{
		if (ev.pointerID === this._lastPointerID)
		{
			_currentPosition.x = ev.stageX;
			_currentPosition.y = ev.stageY;
		}
	};

	/**
	 *  Fires OffClick event if click on unhandled object
	 */
	var onStageMouseDown = function(ev)
	{
		// Keep track of the last pointer ID
		// this allows us to remember the last position
		this._lastPointerID = ev.pointerID;

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
			else if (true && Debug)
			{
				Debug.info("Learning doesn't have an offClick event");
			}
		}
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		//Remove stage listener
		var display = this.display;
		if (display && display.stage)
		{
			var stage = display.stage;
			if (stage)
			{
				stage.removeEventListener("stagemousedown", onStageMouseDown);
				stage.removeEventListener("stagemousemove", onStageMouseMove);
			}
		}
		this.offClickParams = null;
	};

}());