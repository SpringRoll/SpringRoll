/**
 * @module EaselJS Learning
 * @namespace springroll.easeljs
 * @requires Core, Learning
 */
(function(undefined)
{
	var Application = include('springroll.Application');

	/**
	 * Fires DwellTime Learning events for clickable objects
	 * @class DwellTimer
	 * @constructor
	 * @param {createjs.DisplayObject} target  Object for which to add dwellTime events
	 * @param {springroll.Learning} [learning] Learning Dispatcher instance to use
	 */
	var DwellTimer = function(target, learning)
	{
		/**
		 * Interactable DisplayObject
		 * @property {createjs.DisplayObject} target
		 */
		this.target = target;

		if (target.name === undefined)
		{
			throw "DwellTimer object target needs a name";
		}

		/**
		 * name of this timer
		 * @property {String}
		 */
		this.timer = target.id + "_dwell";

		/**
		 * Reference to Learning Dispatcher
		 * @property {springroll.Learning} learning
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
	 * minimum length of dwell time necessary to fire event
	 * @property {Number}
	 */
	var MIN_TIME = 1000;

	/**
	 * start timer on mouseover
	 * @method mouseOver
	 * @param {createjs.MouseEvent} ev Mouse Event
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
	 * Dwell ended - fire event if dwelled long enough
	 * @method mouseOut
	 * @param {createjs.MouseEvent} ev Mouse Event
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
	 * Remove all listeners and whatnot
	 * @method destroy
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
	 * Setup a DwellTimer for a DisplayObject.
	 * @method create
	 * @static
	 * @param {createjs.DisplayObject} obj Clickable DisplayObject
	 */
	DwellTimer.create = function(obj)
	{
		DwellTimer.destroy(obj);
		new DwellTimer(obj);
	};

	/**
	 * If exists, cleanup and remove DwellTimer from object
	 * @method destroy
	 * @static
	 * @param {createjs.DisplayObject} obj DisplayObject with DwellTimer to cleanup
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