/**
 *  @module CreateJS Display
 *  @namespace springroll.createjs
 */
(function(undefined)
{

	var Debug = include('springroll.Debug', false),
		Rectangle = include('createjs.Rectangle'),
		Container = include('createjs.Container'),
		ColorMatrix = include('createjs.ColorMatrix'),
		ColorFilter = include('createjs.ColorFilter'),
		ColorMatrixFilter = include('createjs.ColorMatrixFilter'),
		Text = include('createjs.Text'),
		Event = include('createjs.Event'),
		Point = include('createjs.Point'),
		Bitmap = include('createjs.Bitmap');

	/**
	 *  A Multipurpose button class. It is designed to have one image, and an optional text label.
	 *  The button can be a normal button or a selectable button.
	 *  The button functions similarly with both CreateJS and PIXI, but slightly differently in
	 *  initialization and callbacks. Add event listeners for click and mouseover to know about
	 *  button clicks and mouse overs, respectively.
	 *
	 *  @class Button
	 *  @extends createjs.Container
	 *  @constructor
	 *  @param {Object|Image|HTMLCanvasElement} [imageSettings] Information about the art to be used for button states, as well as if the button is selectable or not.
	 *         If this is an Image or Canvas element, then the button assumes that the image is full width and 3 images
	 *         tall, in the order (top to bottom) up, over, down. If so, then the properties of imageSettings are ignored.
	 *  @param {Image|HTMLCanvasElement} [imageSettings.image] The image to use for all of the button states.
	 *  @param {Array} [imageSettings.priority=null] The state priority order. If omitted, defaults to ["disabled", "down", "over", "up"].
	 *         Previous versions of Button used a hard coded order: ["highlighted", "disabled", "down", "over", "selected", "up"].
	 *  @param {Object} [imageSettings.up] The visual information about the up state.
	 *  @param {createjs.Rectangle} [imageSettings.up.src] The sourceRect for the state within the image.
	 *  @param {createjs.Rectangle} [imageSettings.up.trim=null] Trim data about the state, where x & y are how many pixels were
	 *         trimmed off the left and right, and height & width are the untrimmed size of the button.
	 *  @param {Object} [imageSettings.up.label=null] Label information specific to this state. Properties on this parameter override data
	 *         in the label parameter for this button state only. All values except "text" from the label parameter may be overridden.
	 *  @param {Object} [imageSettings.over=null] The visual information about the over state. If omitted, uses the up state.
	 *  @param {createjs.Rectangle} [imageSettings.over.src] The sourceRect for the state within the image.
	 *  @param {createjs.Rectangle} [imageSettings.over.trim=null] Trim data about the state, where x & y are how many pixels were
	 *         trimmed off the left and right, and height & width are the untrimmed size of the button.
	 *  @param {Object} [imageSettings.over.label=null] Label information specific to this state. Properties on this parameter override data
	 *         in the label parameter for this button state only. All values except "text" from the label parameter may be overridden.
	 *  @param {Object} [imageSettings.down=null] The visual information about the down state. If omitted, uses the up state.
	 *  @param {createjs.Rectangle} [imageSettings.down.src] The sourceRect for the state within the image.
	 *  @param {createjs.Rectangle} [imageSettings.down.trim=null] Trim data about the state, where x & y are how many pixels were
	 *         trimmed off the left and right, and height & width are the untrimmed size of the button.
	 *  @param {Object} [imageSettings.down.label=null] Label information specific to this state. Properties on this parameter override data
	 *         in the label parameter for this button state only. All values except "text" from the label parameter may be overridden.
	 *  @param {Object} [imageSettings.disabled=null] The visual information about the disabled state. If omitted, uses the up state.
	 *  @param {createjs.Rectangle} [imageSettings.disabled.src] The sourceRect for the state within the image.
	 *  @param {createjs.Rectangle} [imageSettings.disabled.trim=null] Trim data about the state, where x & y are how many pixels were
	 *         trimmed off the left and right, and height & width are the untrimmed size of the button.
	 *  @param {Object} [imageSettings.disabled.label=null] Label information specific to this state. Properties on this parameter override
	 *         data in the label parameter for this button state only. All values except "text" from the label parameter may be overridden.
	 *  @param {Object} [imageSettings.<yourCustomState>=null] The visual information about a custom state found in imageSettings.priority.
	 *         Any state added this way has a property of the same name added to the button. Examples of previous states that have been
	 *         moved to this system are "selected" and "highlighted".
	 *  @param {createjs.Rectangle} [imageSettings.<yourCustomState>.src] The sourceRect for the state within the image.
	 *  @param {createjs.Rectangle} [imageSettings.<yourCustomState>.trim=null] Trim data about the state, where x & y are how many pixels
	 *         were trimmed off the left and right, and height & width are the untrimmed size of the button.
	 *  @param {Object} [imageSettings.<yourCustomState>.label=null] Label information specific to this state. Properties on this parameter
	 *         override data in the label parameter for this button state only. All values except "text" from the label parameter may be
	 *         overridden.
	 *  @param {createjs.Point} [imageSettings.origin=null] An optional offset for all button graphics, in case you want button
	 *         positioning to not include a highlight glow, or any other reason you would want to offset the button art and label.
	 *  @param {Object} [label=null] Information about the text label on the button. Omitting this makes the button not use a label.
	 *  @param {String} [label.text] The text to display on the label.
	 *  @param {String} [label.font] The font name and size to use on the label, as createjs.Text expects.
	 *  @param {String} [label.color] The color of the text to use on the label, as createjs.Text expects.
	 *  @param {String} [label.textBaseline="middle"] The baseline for the label text, as createjs.Text expects.
	 *  @param {Object} [label.stroke=null] The stroke to use for the label text, if desired, as createjs.Text (springroll fork only) expects.
	 *  @param {createjs.Shadow} [label.shadow=null] A shadow object to apply to the label text.
	 *  @param {String|Number} [label.x="center"] An x position to place the label text at relative to the button. If omitted,
	 *         "center" is used, which attempts to horizontally center the label on the button.
	 *  @param {String|Number} [label.y="center"] A y position to place the label text at relative to the button. If omitted,
	 *         "center" is used, which attempts to vertically center the label on the button. This may be unreliable -
	 *         see documentation for createjs.Text.getMeasuredLineHeight().
	 *  @param {Boolean} [enabled=true] Whether or not the button is initially enabled.
	 */
	var Button = function(imageSettings, label, enabled)
	{
		if (!imageSettings && DEBUG)
		{
			throw "springroll.createjs.Button requires an image as the first parameter";
		}

		Container.call(this);

		/**
		 *  The sprite that is the body of the button.
		 *  @public
		 *  @property {createjs.Bitmap} back
		 *  @readOnly
		 */
		this.back = null;

		/**
		 *  The text field of the button. The label is centered by both width and height on the button.
		 *  @public
		 *  @property {createjs.Text} label
		 *  @readOnly
		 */
		this.label = null;

		//===callbacks for mouse/touch events
		/**
		 * Callback for mouse over, bound to this button.
		 * @private
		 * @property {Function} _overCB
		 */
		this._overCB = this._onMouseOver.bind(this);

		/**
		 * Callback for mouse out, bound to this button.
		 * @private
		 * @property {Function} _outCB
		 */
		this._outCB = this._onMouseOut.bind(this);

		/**
		 * Callback for mouse down, bound to this button.
		 * @private
		 * @property {Function} _downCB
		 */
		this._downCB = this._onMouseDown.bind(this);

		/**
		 * Callback for press up, bound to this button.
		 * @private
		 * @property {Function} _upCB
		 */
		this._upCB = this._onMouseUp.bind(this);

		/**
		 * Callback for click, bound to this button.
		 * @private
		 * @property {Function} _clickCB
		 */
		this._clickCB = this._onClick.bind(this);

		/**
		 * A dictionary of state booleans, keyed by state name.
		 * @private
		 * @property {Object} _stateFlags
		 */
		this._stateFlags = {};

		/**
		 * An array of state names (Strings), in their order of priority.
		 * The standard order previously was ["highlighted", "disabled", "down", "over", "selected", "up"].
		 * @private
		 * @property {Array} _statePriority
		 */
		this._statePriority = null;

		/**
		 * A dictionary of state graphic data, keyed by state name.
		 * Each object contains the sourceRect (src) and optionally 'trim', another Rectangle.
		 * Additionally, each object will contain a 'label' object if the button has a text label.
		 * @private
		 * @property {Object} _stateData
		 */
		this._stateData = {};

		/**
		 * The width of the button art, independent of the scaling of the button itself.
		 * @private
		 * @property {Number} _width
		 */
		this._width = 0;

		/**
		 * The height of the button art, independent of the scaling of the button itself.
		 * @private
		 * @property {Number} _height
		 */
		this._height = 0;

		/**
		 * An offset to button positioning, generally used to adjust for a highlight around the button.
		 * @private
		 * @property {createjs.Point} _offset
		 */
		this._offset = new Point();

		this.buttonInitialize(imageSettings, label, enabled);
	};

	// Extend Container
	var p = extend(Button, Container);

	var s = Container.prototype; //super

	/**
	 * An event for when the button is pressed (while enabled).
	 * @public
	 * @static
	 * @property {String} BUTTON_PRESS
	 */
	Button.BUTTON_PRESS = "buttonPress";

	/*
	 * A list of state names that should not have properties autogenerated.
	 * @private
	 * @static
	 * @property {Array} RESERVED_STATES
	 */
	var RESERVED_STATES = ["disabled", "enabled", "up", "over", "down"];
	/*
	 * A state priority list to use as the default.
	 * @private
	 * @static
	 * @property {Array} DEFAULT_PRIORITY
	 */
	var DEFAULT_PRIORITY = ["disabled", "down", "over", "up"];

	/**
	 *  Constructor for the button when using CreateJS.
	 *  @method buttonInitialize
	 *  @param {Object|Image|HTMLCanvasElement} [imageSettings] See the constructor for more information
	 *  @param {Object} [label=null] Information about the text label on the button. Omitting this makes the button not use a label.
	 *  @param {Boolean} [enabled=true] Whether or not the button is initially enabled.
	 */
	p.buttonInitialize = function(imageSettings, label, enabled)
	{
		this.mouseChildren = false; //input events should have this button as a target, not the child Bitmap.

		var _stateData = this._stateData;

		//a clone of the label data to use as a default value, without changing the original
		var labelData;
		if (label)
		{
			labelData = clone(label);
			delete labelData.text;
			if (labelData.x === undefined)
				labelData.x = "center";
			if (labelData.y === undefined)
				labelData.y = "center";
		}

		var image, width, height, i, state;
		if (imageSettings.image) //is a settings object with rectangles
		{
			image = imageSettings.image;
			this._statePriority = imageSettings.priority || DEFAULT_PRIORITY;

			//each rects object has a src property (createjs.Rectangle), and optionally a trim rectangle
			var inputData, stateLabel;
			for (i = this._statePriority.length - 1; i >= 0; --i) //start at the end to start at the up state
			{
				state = this._statePriority[i];
				//set up the property for the state so it can be set - the function will ignore reserved states
				this._addProperty(state);
				//set the default value for the state flag
				if (state != "disabled" && state != "up")
				{
					this._stateFlags[state] = false;
				}
				inputData = imageSettings[state];
				//it's established that over, down, and particularly disabled default to the up state
				_stateData[state] = inputData ? clone(inputData) : _stateData.up;
				//set up the label info for this state
				if (label)
				{
					//if there is actual label data for this state, use that
					if (inputData && inputData.label)
					{
						inputData = inputData.label;
						stateLabel = _stateData[state].label = {};
						stateLabel.font = inputData.font || labelData.font;
						stateLabel.color = inputData.color || labelData.color;
						stateLabel.stroke = inputData.hasOwnProperty("stroke") ? inputData.stroke : labelData.stroke;
						stateLabel.shadow = inputData.hasOwnProperty("shadow") ? inputData.shadow : labelData.shadow;
						stateLabel.textBaseline = inputData.textBaseline || labelData.textBaseline;
						stateLabel.x = inputData.x || labelData.x;
						stateLabel.y = inputData.y || labelData.y;
					}
					//otherwise use the default
					else
					{
						_stateData[state].label = labelData;
					}
				}
			}

			if (_stateData.up.trim) //if the texture is trimmed, use that for the sizing
			{
				var upTrim = _stateData.up.trim;
				width = upTrim.width;
				height = upTrim.height;
			}
			else //texture is not trimmed and is full size
			{
				width = _stateData.up.src.width;
				height = _stateData.up.src.height;
			}
			//ensure that our required states exist
			if (!_stateData.up)
			{
				if (DEBUG && Debug)
				{
					Debug.error("Button lacks an up state! This is a serious problem! Input data follows:");
					Debug.error(imageSettings);
				}
			}
			if (!_stateData.over)
			{
				_stateData.over = _stateData.up;
			}
			if (!_stateData.down)
			{
				_stateData.down = _stateData.up;
			}
			if (!_stateData.disabled)
			{
				_stateData.disabled = _stateData.up;
			}
			//set up the offset
			if (imageSettings.offset)
			{
				this._offset.x = imageSettings.offset.x;
				this._offset.y = imageSettings.offset.y;
			}
			else
			{
				this._offset.x = this._offset.y = 0;
			}
		}
		else //imageSettings is just an image to use directly - use the old stacked images method
		{
			image = imageSettings;
			width = image.width;
			height = image.height / 3;
			this._statePriority = DEFAULT_PRIORITY;
			_stateData.disabled = _stateData.up = {
				src: new Rectangle(0, 0, width, height)
			};
			_stateData.over = {
				src: new Rectangle(0, height, width, height)
			};
			_stateData.down = {
				src: new Rectangle(0, height * 2, width, height)
			};
			if (labelData)
			{
				_stateData.up.label =
					_stateData.over.label =
					_stateData.down.label =
					_stateData.disabled.label = labelData;
			}
			this._offset.x = this._offset.y = 0;
		}

		this.back = new Bitmap(image);
		this.addChild(this.back);
		this._width = width;
		this._height = height;

		if (label)
		{
			this.label = new Text(label.text || "", _stateData.up.label.font, _stateData.up.label.color);
			this.addChild(this.label);
		}

		//set the button state initially
		this.enabled = enabled === undefined ? true : !!enabled;
	};

	/*
	 *  A simple function for making a shallow copy of an object.
	 */
	function clone(obj)
	{
		if (!obj || "object" != typeof obj) return null;
		var copy = obj.constructor();
		if (!copy)
			copy = {};
		for (var attr in obj)
		{
			if (obj.hasOwnProperty(attr))
			{
				copy[attr] = obj[attr];
			}
		}
		return copy;
	}

	/**
	 *  The width of the button, based on the width of back. This value is affected by scale.
	 *  @property {Number} width
	 */
	Object.defineProperty(p, "width",
	{
		get: function()
		{
			return this._width * this.scaleX;
		},
		set: function(value)
		{
			this.scaleX = value / this._width;
		}
	});

	/**
	 *  The height of the button, based on the height of back. This value is affected by scale.
	 *  @property {Number} height
	 */
	Object.defineProperty(p, "height",
	{
		get: function()
		{
			return this._height * this.scaleY;
		},
		set: function(value)
		{
			this.scaleY = value / this._height;
		}
	});

	/**
	 *  Sets the text of the label. This does nothing if the button was not initialized with a label.
	 *  @public
	 *  @method setText
	 *  @param {String} text The text to set the label to.
	 */
	p.setText = function(text)
	{
		if (this.label)
		{
			this.label.text = text;
			var data;
			for (var i = 0, len = this._statePriority.length; i < len; ++i)
			{
				if (this._stateFlags[this._statePriority[i]])
				{
					data = this._stateData[this._statePriority[i]];
					break;
				}
			}
			if (!data)
				data = this._stateData.up;
			data = data.label;
			if (data.x == "center")
				this.label.x = (this._width - this.label.getMeasuredWidth()) * 0.5 + this._offset.x;
			else
				this.label.x = data.x + this._offset.x;
			if (data.y == "center")
				this.label.y = this._height * 0.5 + this._offset.y;
			else
				this.label.y = data.y + this._offset.y;
		}
	};

	/**
	 *  Whether or not the button is enabled.
	 *  @property {Boolean} enabled
	 *  @default true
	 */
	Object.defineProperty(p, "enabled",
	{
		get: function()
		{
			return !this._stateFlags.disabled;
		},
		set: function(value)
		{
			this._stateFlags.disabled = !value;

			if (value)
			{
				this.cursor = 'pointer';
				this.addEventListener('mousedown', this._downCB);
				this.addEventListener('mouseover', this._overCB);
				this.addEventListener('mouseout', this._outCB);
			}
			else
			{
				this.cursor = null;
				this.removeEventListener('mousedown', this._downCB);
				this.removeEventListener('mouseover', this._overCB);
				this.removeEventListener('mouseout', this._outCB);
				this.removeEventListener('pressup', this._upCB);
				this.removeEventListener("click", this._clickCB);
				this._stateFlags.down = this._stateFlags.over = false;
			}

			this._updateState();
		}
	});

	/**
	 *  Adds a property to the button. Setting the property sets the value in
	 *  _stateFlags and calls _updateState().
	 *  @private
	 *  @method _addProperty
	 *  @param {String} propertyName The property name to add to the button.
	 */
	p._addProperty = function(propertyName)
	{
		//check to make sure we don't add reserved names
		if (RESERVED_STATES.indexOf(propertyName) >= 0) return;

		Object.defineProperty(this, propertyName,
		{
			get: function()
			{
				return this._stateFlags[propertyName];
			},
			set: function(value)
			{
				this._stateFlags[propertyName] = value;
				this._updateState();
			}
		});
	};

	/**
	 *  Updates back based on the current button state.
	 *  @private
	 *  @method _updateState
	 */
	p._updateState = function()
	{
		if (!this.back) return;
		var data;
		//use the highest priority state
		for (var i = 0, len = this._statePriority.length; i < len; ++i)
		{
			if (this._stateFlags[this._statePriority[i]])
			{
				data = this._stateData[this._statePriority[i]];
				break;
			}
		}
		//if no state is active, use the up state
		if (!data)
			data = this._stateData.up;
		this.back.sourceRect = data.src;
		//position the button back
		if (data.trim)
		{
			this.back.x = data.trim.x + this._offset.x;
			this.back.y = data.trim.y + this._offset.y;
		}
		else
		{
			this.back.x = this._offset.x;
			this.back.y = this._offset.y;
		}
		//if we have a label, update that too
		if (this.label)
		{
			data = data.label;
			//update the text properties
			this.label.textBaseline = data.textBaseline || "middle"; //Middle is easy to center
			this.label.stroke = data.stroke;
			this.label.shadow = data.shadow;
			this.label.font = data.font;
			this.label.color = data.color || "#000"; //default for createjs.Text
			//position the text
			if (data.x == "center")
				this.label.x = (this._width - this.label.getMeasuredWidth()) * 0.5 + this._offset.x;
			else
				this.label.x = data.x + this._offset.x;
			if (data.y == "center")
				this.label.y = this._height * 0.5 + this._offset.y;
			else
				this.label.y = data.y + this._offset.y;
		}
	};

	/**
	 *  The callback for when the button receives a mouse down event.
	 *  @private
	 *  @method _onMouseDown
	 */
	p._onMouseDown = function(e)
	{
		this.addEventListener('pressup', this._upCB);
		this.addEventListener("click", this._clickCB);
		this._stateFlags.down = true;
		this._updateState();
	};

	/**
	 *  The callback for when the button for when the mouse/touch is released on the button
	 *  - only when the button was held down initially.
	 *  @private
	 *  @method _onMouseUp
	 */
	p._onMouseUp = function(e)
	{
		this.removeEventListener('pressup', this._upCB);
		this.removeEventListener("click", this._clickCB);
		this._stateFlags.down = false;
		//if the over flag is true, then the mouse was released while on the button, thus being a click
		this._updateState();
	};

	/**
	 *  The callback for when the button the button is clicked or tapped on. This is
	 *  the most reliable way of detecting mouse up/touch end events that are on this button
	 *  while letting the pressup event handle the mouse up/touch ends on and outside the button.
	 *  @private
	 *  @method _onClick
	 */
	p._onClick = function(e)
	{
		this.dispatchEvent(new Event(Button.BUTTON_PRESS));
	};

	/**
	 *  The callback for when the button is moused over.
	 *  @private
	 *  @method _onMouseOver
	 */
	p._onMouseOver = function(e)
	{
		this._stateFlags.over = true;
		this._updateState();
	};

	/**
	 *  The callback for when the mouse leaves the button area.
	 *  @private
	 *  @method _onMouseOut
	 */
	p._onMouseOut = function(e)
	{
		this._stateFlags.over = false;
		this._updateState();
	};

	/**
	 *  Destroys the button.
	 *  @public
	 *  @method destroy
	 */
	p.destroy = function()
	{
		this.removeAllChildren();
		this.removeAllEventListeners();
		this._downCB = null;
		this._upCB = null;
		this._overCB = null;
		this._outCB = null;
		this.back = null;
		this.label = null;
		this._statePriority = null;
		this._stateFlags = null;
		this._stateData = null;
	};

	/**
	 *  Generates a desaturated up state as a disabled state, and an update with a solid colored glow for a highlighted state.
	 *  @method generateDefaultStates
	 *  @static
	 *  @param {Image|HTMLCanvasElement} image The image to use for all of the button states, in the standard up/over/down format.
	 *  @param {Object} [disabledSettings] The settings object for the disabled state. If omitted, no disabled state is created.
	 *  @param {Number} [disabledSettings.saturation] The saturation adjustment for the disabled state.
	 *			100 is fully saturated, 0 is unchanged, -100 is desaturated.
	 *  @param {Number} [disabledSettings.brightness] The brightness adjustment for the disabled state.
	 *			100 is fully bright, 0 is unchanged, -100 is completely dark.
	 *  @param {Number} [disabledSettings.contrast] The contrast adjustment for the disabled state.
	 *			100 is full contrast, 0 is unchanged, -100 is no contrast.
	 *  @param {Object} [highlightSettings] The settings object for the highlight state. If omitted, no state is created.
	 *  @param {Number} [highlightSettings.size] How many pixels to make the glow, eg 8 for an 8 pixel increase on each side.
	 *  @param {Number} [highlightSettings.red] The red value for the glow, from 0 to 255.
	 *  @param {Number} [highlightSettings.green] The green value for the glow, from 0 to 255.
	 *  @param {Number} [highlightSettings.blue] The blue value for the glow, from 0 to 255.
	 *  @param {Number} [highlightSettings.alpha=255] The alpha value for the glow, from 0 to 255, with 0 being transparent and 255 fully opaque.
	 *  @param {Array} [highlightSettings.rgba] An array of values to use for red, green, blue, and optionally alpha that can be used
	 *			instead of providing separate properties on highlightSettings.
	 */
	Button.generateDefaultStates = function(image, disabledSettings, highlightSettings)
	{
		//figure out the normal button size
		var buttonWidth = image.width;
		var buttonHeight = image.height / 3;
		//create a canvas element and size it
		var canvas = document.createElement("canvas");
		var width = buttonWidth;
		var height = image.height;
		if (disabledSettings)
		{
			height += buttonHeight;
		}
		if (highlightSettings)
		{
			if (DEBUG && Debug) Debug.log(highlightSettings.rgba);
			width += highlightSettings.size * 2;
			height += buttonHeight + highlightSettings.size * 2;
			if (highlightSettings.rgba)
			{
				highlightSettings.red = highlightSettings.rgba[0];
				highlightSettings.green = highlightSettings.rgba[1];
				highlightSettings.blue = highlightSettings.rgba[2];

				if (highlightSettings.rgba[3])
				{
					highlightSettings.alpha = highlightSettings.rgba[3];
				}
			}
		}
		canvas.width = width;
		canvas.height = height;
		//get the drawing context
		var context = canvas.getContext("2d");
		//draw the image to it
		context.drawImage(image, 0, 0);
		//start setting up the output
		var output = {
			image: canvas,
			up:
			{
				src: new Rectangle(0, 0, buttonWidth, buttonHeight)
			},
			over:
			{
				src: new Rectangle(0, buttonHeight, buttonWidth, buttonHeight)
			},
			down:
			{
				src: new Rectangle(0, buttonHeight * 2, buttonWidth, buttonHeight)
			}
		};
		//set up a bitmap to draw other states with
		var drawingBitmap = new Bitmap(image);
		drawingBitmap.sourceRect = output.up.src;
		//set up a y position for where the next state should go in the canvas
		var nextY = image.height;
		if (disabledSettings)
		{
			context.save();
			//position the button to draw
			context.translate(0, nextY);
			//set up the desaturation matrix
			var matrix = new ColorMatrix();
			if (disabledSettings.saturation !== undefined)
				matrix.adjustSaturation(disabledSettings.saturation);
			if (disabledSettings.brightness !== undefined)
				matrix.adjustBrightness(disabledSettings.brightness * 2.55); //convert to CreateJS's -255->255 system from -100->100
			if (disabledSettings.contrast !== undefined)
				matrix.adjustContrast(disabledSettings.contrast);
			drawingBitmap.filters = [new ColorMatrixFilter(matrix)];
			//draw the state
			drawingBitmap.cache(0, 0, output.up.src.width, output.up.src.height);
			drawingBitmap.draw(context);
			//update the output with the state
			output.disabled = {
				src: new Rectangle(0, nextY, buttonWidth | 0, buttonHeight | 0)
			};
			nextY += buttonHeight; //set up the next position for the highlight state, if we have it
			context.restore(); //reset any transformations
		}
		if (highlightSettings)
		{
			context.save();
			//calculate the size of this state
			var highlightStateWidth = buttonWidth + highlightSettings.size * 2;
			var highlightStateHeight = buttonHeight + highlightSettings.size * 2;
			//set up the color changing filter
			drawingBitmap.filters = [new ColorFilter(0, 0, 0, 1,
				/*r*/
				highlightSettings.red,
				/*g*/
				highlightSettings.green,
				/*b*/
				highlightSettings.blue,
				highlightSettings.alpha !== undefined ? -255 + highlightSettings.alpha : 0)];
			//size the colored highlight
			drawingBitmap.scaleX = (highlightStateWidth) / buttonWidth;
			drawingBitmap.scaleY = (highlightStateHeight) / buttonHeight;
			//position it
			drawingBitmap.x = 0;
			drawingBitmap.y = nextY;
			//draw the state
			drawingBitmap.cache(0, 0, highlightStateWidth, highlightStateHeight);
			drawingBitmap.updateContext(context);
			drawingBitmap.draw(context);
			context.restore(); //reset any transformations
			//size and position it to normal
			drawingBitmap.scaleX = drawingBitmap.scaleY = 1;
			drawingBitmap.x = highlightSettings.size;
			drawingBitmap.y = nextY + highlightSettings.size;
			drawingBitmap.filters = null;
			drawingBitmap.uncache();
			//draw the up state over the highlight state glow
			drawingBitmap.updateContext(context);
			drawingBitmap.draw(context);
			//set up the trim values for the other states
			var trim = new Rectangle(
				highlightSettings.size,
				highlightSettings.size,
				highlightStateWidth,
				highlightStateHeight);
			output.up.trim = trim;
			output.over.trim = trim;
			output.down.trim = trim;
			if (output.disabled)
				output.disabled.trim = trim;
			//set up the highlight state for the button
			output.highlighted = {
				src: new Rectangle(0, nextY, highlightStateWidth | 0, highlightStateHeight | 0)
			};
			//set up the state priority to include the highlighted state
			output.priority = DEFAULT_PRIORITY.slice();
			output.priority.unshift("highlighted");
			//add in an offset to the button to account for the highlight glow without affecting button positioning
			output.offset = {
				x: -highlightSettings.size,
				y: -highlightSettings.size
			};
		}
		return output;
	};

	namespace('springroll').Button = Button;
	namespace('springroll.createjs').Button = Button;
}());