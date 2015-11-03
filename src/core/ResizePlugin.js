/**
 * @module Core
 * @namespace springroll
 */
(function()
{
	var ApplicationPlugin = include('springroll.ApplicationPlugin');
	var devicePixelRatio = include('devicePixelRatio', false);

	/**
	 * @class Application
	 */
	var plugin = new ApplicationPlugin(100);

	/**
	 * Dom element (or the window) to attach resize listeners and read the size from
	 * @property {DOMElement|Window|null} _resizeElement
	 * @private
	 * @default null
	 */
	var _resizeElement = null;

	/**
	 * The maximum width of the primary display, compared to the original height.
	 * @property {Number} _maxWidth
	 * @private
	 */
	var _maxWidth = 0;

	/**
	 * The maximum height of the primary display, compared to the original width.
	 * @property {Number} _maxHeight
	 * @private
	 */
	var _maxHeight = 0;

	/**
	 * The original width of the primary display, used to calculate the aspect ratio.
	 * @property {int} _originalWidth
	 * @private
	 */
	var _originalWidth = 0;

	/**
	 * The original height of the primary display, used to calculate the aspect ratio.
	 * @property {int} _originalHeight
	 * @private
	 */
	var _originalHeight = 0;

	/**
	 * A helper object to avoid object creation each resize event.
	 * @property {Object} _resizeHelper
	 * @private
	 */
	var _resizeHelper = {
		width: 0,
		height: 0,
		normalWidth: 0,
		normalHeight: 0
	};

	/**
	 * The timeout when the window is being resized
	 * @property {springroll.DelayedCall} _windowResizer
	 * @private
	 */
	var _windowResizer = null;

	// Init the animator
	plugin.setup = function()
	{
		var options = this.options;

		/**
		 * Fired when a resize is called
		 * @event resize
		 * @param {int} width The width of the resize element
		 * @param {int} height The height of the resize element
		 */

		/**
		 * If doing uniform resizing, optional parameter to add
		 * a maximum width relative to the original height. This
		 * allows for "title-safe" responsiveness. Must be greater
		 * than the original width of the canvas.
		 * @property {int} options.maxWidth
		 */
		options.add('maxWidth', 0);

		/**
		 * If doing uniform resizing, optional parameter to add
		 * a maximum height relative to the original width. This
		 * allows for "title-safe" responsiveness. Must be greater
		 * than the original height of the canvas.
		 * @property {int} options.maxHeight
		 */
		options.add('maxHeight', 0);

		/**
		 * Whether to resize the displays to the original aspect ratio
		 * @property {Boolean} options.uniformResize
		 * @default true
		 */
		options.add('uniformResize', true);

		/**
		 * If responsive is true, the width and height properties
		 * are adjusted on the `<canvas>` element. It's assumed that
		 * responsive applications will adjust their own elements.
		 * If responsive is false then the style properties are changed.
		 * @property {Boolean} options.responsive
		 * @default false
		 */
		options.add('responsive', false, true);

		/**
		 * The element that the canvas is resized to fit.
		 * @property {DOMElement|String} options.resizeElement
		 * @default 'frame'
		 */
		options.add('resizeElement', 'frame', true);

		/**
		 * Whether to account for devicePixelRatio when rendering game
		 * @property {Boolean} options.enableHiDPI
		 * @default false
		 */
		options.add('enableHiDPI', false);

		options.on('maxWidth', function(value)
		{
			_maxWidth = value;
		});

		options.on('maxHeight', function(value)
		{
			_maxHeight = value;
		});

		// Handle when a display is added, only do it once
		// in order to get the main display
		this.once('displayAdded', function(display)
		{
			_originalWidth = display.width;
			_originalHeight = display.height;
			if (!_maxWidth)
				_maxWidth = _originalWidth;
			if (!_maxHeight)
				_maxHeight = _originalHeight;
		});

		/**
		 * The current width of the application, in real point values
		 * @property {int} realWidth
		 */
		this.realWidth = 0;

		/**
		 * The current height of the application, in real point values
		 * @property {int} realHeight
		 */
		this.realHeight = 0;

		/**
		 * Fire a resize event with the current width and height of the display
		 * @method triggerResize
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
			var width = this.realWidth = _resizeHelper.width;
			var height = this.realHeight = _resizeHelper.height;
			var normalWidth = _resizeHelper.normalWidth;
			var normalHeight = _resizeHelper.normalHeight;

			var responsive = this.options.responsive;
			var enableHiDPI = this.options.enableHiDPI;

			//resize the displays
			this.displays.forEach(function(display)
			{
				if (responsive)
				{
					if (enableHiDPI && devicePixelRatio)
					{
						display.canvas.style.width = width + "px";
						display.canvas.style.height = height + "px";
						width *= devicePixelRatio;
						height *= devicePixelRatio;
					}
					// update the dimensions of the canvas
					display.resize(width, height);
				}
				else
				{
					// scale the canvas element
					display.canvas.style.width = width + "px";
					display.canvas.style.height = height + "px";

					if (enableHiDPI && devicePixelRatio)
					{
						normalWidth *= devicePixelRatio;
						normalHeight *= devicePixelRatio;
					}
					// Update the canvas size for maxWidth and maxHeight
					display.resize(normalWidth, normalHeight);
				}
			});

			//send out the resize event
			this.trigger('resize', (responsive ? width : normalWidth), (responsive ? height : normalHeight));

			//redraw all displays
			this.displays.forEach(function(display)
			{
				display.render(0, true); // force renderer
			});
		};

		/**
		 * Handle the window resize events
		 * @method onWindowResize
		 * @protected
		 */
		this.onWindowResize = function()
		{
			// Call the resize once
			this.triggerResize();

			// After a short timeout, call the resize again
			// this will solve issues where the window doesn't
			// properly get the "full" resize, like on some mobile
			// devices when pulling-down/releasing the HUD
			_windowResizer = this.setTimeout(
				function()
				{
					this.triggerResize();
					_windowResizer = null;
				}
				.bind(this),
				500
			);
		};

		/**
		 * Calculates the resizing of displays. By default, this limits the new size
		 * to the initial aspect ratio of the primary display. Override this function
		 * if you need variable aspect ratios.
		 * @method calculateDisplaySize
		 * @protected
		 * @param {Object} size A size object containing the width and height of the resized container.
		 *                     The size parameter is also the output of the function, so the size
		 *                     properties are edited in place.
		 * @param {int} size.width The width of the resized container.
		 * @param {int} size.height The height of the resized container.
		 */
		this.calculateDisplaySize = function(size)
		{
			if (!_originalHeight || !this.options.uniformResize) return;

			var maxAspectRatio = _maxWidth / _originalHeight,
				minAspectRatio = _originalWidth / _maxHeight,
				originalAspect = _originalWidth / _originalHeight,
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


			// Calculate the unscale, real-sizes
			currentAspect = size.width / size.height;
			size.normalWidth = _originalWidth;
			size.normalHeight = _originalHeight;

			if (currentAspect > originalAspect)
			{
				size.normalWidth = _originalHeight * currentAspect;
			}
			else if (currentAspect < originalAspect)
			{
				size.normalHeight = _originalWidth / currentAspect;
			}

			// round up, as canvases require integer sizes
			// and canvas should be slightly larger to avoid
			// a hairline around outside of the canvas
			size.width = Math.ceil(size.width);
			size.height = Math.ceil(size.height);
			size.normalWidth = Math.ceil(size.normalWidth);
			size.normalHeight = Math.ceil(size.normalHeight);
		};

		// Do an initial resize to make sure everything is positioned correctly
		this.once('beforeInit', this.triggerResize);
	};

	// Add common filters interaction
	plugin.preload = function(done)
	{
		var options = this.options;

		// Convert to DOM element
		options.asDOMElement('resizeElement');

		if (options.resizeElement)
		{
			_resizeElement = options.resizeElement;
			this.onWindowResize = this.onWindowResize.bind(this);
			window.addEventListener("resize", this.onWindowResize);
		}
		done();
	};

	plugin.teardown = function()
	{
		if (_windowResizer)
		{
			_windowResizer.destroy();
			_windowResizer = null;
		}

		if (_resizeElement)
		{
			window.removeEventListener("resize", this.onWindowResize);
		}
		_resizeElement = null;

		_resizeHelper.width =
			_resizeHelper.height =
			_resizeHelper.normalWidth =
			_resizeHelper.normalHeight =
			_originalWidth =
			_originalHeight =
			_maxHeight =
			_maxWidth = 0;

	};

}());