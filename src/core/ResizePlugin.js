/**
 *	@module Core
 *	@namespace springroll
 */
(function()
{
	/**
	 *	Create an app plugin for resizing application, all properties and methods documented
	 *	in this class are mixed-in to the main Application
	 *	@class ResizePlugin
	 *	@extends springroll.ApplicationPlugin
	 */
	var plugin = mixin({}, 'springroll.ApplicationPlugin', 100);

	/**
	*  Dom element (or the window) to attach resize listeners and read the size from
	*  @property {DOMElement|Window|null} _resizeElement
	*  @private
	*  @default null
	*/
	var _resizeElement = null;

	/**
	*  The maximum width of the primary display, compared to the original height.
	*  @property {Number} _maxWidth
	*  @private
	*/
	var _maxWidth = 0;
	
	/**
	*  The maximum height of the primary display, compared to the original width.
	*  @property {Number} _maxHeight
	*  @private
	*/
	var _maxHeight = 0;
	
	/**
	*  The original width of the primary display, used to calculate the aspect ratio.
	*  @property {int} _originalWidth
	*  @private
	*/
	var _originalWidth = 0;
	
	/**
	*  The original height of the primary display, used to calculate the aspect ratio.
	*  @property {int} _originalHeight
	*  @private
	*/
	var _originalHeight = 0;

	/**
	 *  A helper object to avoid object creation each resize event.
	 *  @property {Object} _resizeHelper
	 *  @private
	 */
	var _resizeHelper = {
		width: 0,
		height: 0
	};

	// Init the animator
	plugin.setup = function()
	{
		/**
		 *  Fired when a resize is called
		 *  @event resize
		 *  @param {int} width The width of the resize element
		 *  @param {int} height The height of the resize element
		 */
		
		/**
		 * If doing uniform resizing, optional parameter to add
		 * a maximum width relative to the original height. This
		 * allows for "title-safe" responsiveness. Must be greater
		 * than the original width of the canvas.
		 * @property {int} options.maxWidth
		 */
		this.options.add('maxWidth', 0);

		/**
		 * If doing uniform resizing, optional parameter to add
		 * a maximum height relative to the original width. This
		 * allows for "title-safe" responsiveness. Must be greater
		 * than the original height of the canvas.
		 * @property {int} options.maxHeight
		 */
		this.options.add('maxHeight', 0);

		/**
		 * Whether to resize the displays to the original aspect ratio
		 * @property {Boolean} options.uniformResize
		 * @default true
		 */
		this.options.add('uniformResize', true);

		/**
		 * The element to resize the canvas to fit
		 * @property {DOMElement|String} options.resizeElement
		 * @default 'frame'
		 */
		this.options.add('resizeElement', 'frame', true);

		this.options.on('maxWidth', function(value)
		{
			_maxWidth = value;
		});

		this.options.on('maxHeight', function(value)
		{
			_maxHeight = value;
		});

		// Handle when a display is added, only do it once
		// in order to get the main display
		this.once('displayAdded', function(display)
		{
			_originalWidth = display.width;
			_originalHeight = display.height;
			if(!_maxWidth)
				_maxWidth = _originalWidth;
			if(!_maxHeight)
				_maxHeight = _originalHeight;
		});

		/**
		 *  Fire a resize event with the current width and height of the display
		 *  @method triggerResize
		 */
		this.triggerResize = function()
		{
			if (!_resizeElement) return;

			// window uses innerWidth, DOM elements clientWidth
			_resizeHelper.width = (_resizeElement.innerWidth || _resizeElement.clientWidth) | 0;
			_resizeHelper.height = (_resizeElement.innerHeight || _resizeElement.clientHeight) | 0;

			this.calculateDisplaySize(_resizeHelper);

			// round up, as canvases require integer sizes
			// and canvas should be slightly larger to avoid
			// a hairline around outside of the canvas
			_resizeHelper.width = Math.ceil(_resizeHelper.width);
			_resizeHelper.height = Math.ceil(_resizeHelper.height);

			//resize the displays
			this.displays.forEach(function(display)
			{
				display.resize(_resizeHelper.width, _resizeHelper.height);
			});

			//send out the resize event
			this.trigger('resize', _resizeHelper.width, _resizeHelper.height);

			//redraw all displays
			this.displays.forEach(function(display)
			{
				display.render(0, true); // force renderer
			});
		};

		/**
		 *  Calculates the resizing of displays. By default, this limits the new size
		 *  to the initial aspect ratio of the primary display. Override this function
		 *  if you need variable aspect ratios.
		 *  @method calculateDisplaySize
		 *  @protected
		 *  @param {Object} size A size object containing the width and height of the resized container.
		 *                       The size parameter is also the output of the function, so the size
		 *                       properties are edited in place.
		 *  @param {int} size.width The width of the resized container.
		 *  @param {int} size.height The height of the resized container.
		 */
		this.calculateDisplaySize = function(size)
		{
			if (!_originalHeight || !this.options.uniformResize) return;

			var maxAspectRatio = _maxWidth / _originalHeight,
				minAspectRatio = _originalWidth / _maxHeight,
				currentAspect = size.width / size.height;

			if (currentAspect < minAspectRatio)
			{
				//limit to the narrower width
				size.height = size.width / minAspectRatio;
			}
			else if (currentAspect > maxAspectRatio)
			{
				//limit to the shorter height
				size.width = size.height * maxAspectRatio;
			}
		};

		// Do an initial resize to make sure everything is positioned correctly
		this.once('beforeInit', this.triggerResize);
	};

	// Add common filteres interaction
	plugin.preload = function(done)
	{
		var options = this.options;

		// Convert to DOM element
		options.asDOMElement('resizeElement');

		if (options.resizeElement)
		{
			_resizeElement = options.resizeElement;
			this.triggerResize = this.triggerResize.bind(this);
			window.addEventListener("resize", this.triggerResize);
		}
		done();
	};

	plugin.teardown = function()
	{
		if (_resizeElement)
		{
			window.removeEventListener("resize", this.triggerResize);
		}
		_resizeElement = null;
		
		_resizeHelper.width =
		_resizeHelper.height = 
		_originalWidth =
		_originalHeight =
		_maxHeight = 
		_maxWidth = 0;

	};

	// Register plugin
	plugin.register();

}());