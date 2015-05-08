/**
 * @module EaselJS Learning
 * @namespace springroll.easeljs
 * @requires Core, Learning
 */
(function()
{
	// Include classes
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

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