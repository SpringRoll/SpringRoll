/*! SpringRoll 1.0.3 */
/**
 * @module EaselJS UI
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function(undefined)
{

	var Debug,
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
	 * A Multipurpose button class. It is designed to have one image, and an optional text label.
	 * The button can be a normal button or a selectable button.
	 * The button functions similarly with both EaselJS and PIXI, but slightly differently in
	 * initialization and callbacks. Add event listeners for click and mouseover to know about
	 * button clicks and mouse overs, respectively.
	 *
	 * @class Button
	 * @extends createjs.Container
	 * @constructor
	 * @param {Object|Image|HTMLCanvasElement} [imageSettings] Information about the art to be used
	 *                                                     for button states, as well as if the
	 *                                                     button is selectable or not. If this
	 *                                                     is an Image or Canvas element, then
	 *                                                     the button assumes that the image is
	 *                                                     full width and 3 images tall, in the
	 *                                                     order (top to bottom) up, over, down.
	 *                                                     If so, then the properties of
	 *                                                     imageSettings are ignored.
	 * @param {Image|HTMLCanvasElement} [imageSettings.image] The image to use for all of the button
	 *                                                    states.
	 * @param {Array} [imageSettings.priority=null] The state priority order. If omitted, defaults to
	 *                                          <code>&#91;"disabled", "down", "over",
	 *                                          "up"&#93;</code>. Previous versions of Button
	 *                                          used a hard coded order:
	 *                                          <code>&#91;"highlighted", "disabled", "down",
	 *                                          "over", "selected", "up"&#93;</code>.
	 * @param {Object} [imageSettings.up] The visual information about the up state.
	 * @param {createjs.Rectangle} [imageSettings.up.src] The sourceRect for the state within the
	 *                                                image.
	 * @param {createjs.Rectangle} [imageSettings.up.trim=null] Trim data about the state, where x &
	 *                                                      y are how many pixels were trimmed
	 *                                                      off the left and right, and height &
	 *                                                      width are the untrimmed size of the
	 *                                                      button.
	 * @param {Object} [imageSettings.up.label=null] Label information specific to this state.
	 *                                           Properties on this parameter override data in
	 *                                           the label parameter for this button state only.
	 *                                           All values except "text" from the label
	 *                                           parameter may be overridden.
	 * @param {Object} [imageSettings.over=null] The visual information about the over state. If
	 *                                       omitted, uses the up state.
	 * @param {createjs.Rectangle} [imageSettings.over.src] The sourceRect for the state within the
	 *                                                  image.
	 * @param {createjs.Rectangle} [imageSettings.over.trim=null] Trim data about the state, where x
	 *                                                        & y are how many pixels were
	 *                                                        trimmed off the left and right, and
	 *                                                        height & width are the untrimmed
	 *                                                        size of the button.
	 * @param {Object} [imageSettings.over.label=null] Label information specific to this state.
	 *                                             Properties on this parameter override data in
	 *                                             the label parameter for this button state
	 *                                             only. All values except "text" from the label
	 *                                             parameter may be overridden.
	 * @param {Object} [imageSettings.down=null] The visual information about the down state. If
	 *                                       omitted, uses the up state.
	 * @param {createjs.Rectangle} [imageSettings.down.src] The sourceRect for the state within the
	 *                                                  image.
	 * @param {createjs.Rectangle} [imageSettings.down.trim=null] Trim data about the state, where x
	 *                                                        & y are how many pixels were
	 *                                                        trimmed off the left and right, and
	 *                                                        height & width are the untrimmed
	 *                                                        size of the button.
	 * @param {Object} [imageSettings.down.label=null] Label information specific to this state.
	 *                                             Properties on this parameter override data in
	 *                                             the label parameter for this button state
	 *                                             only. All values except "text" from the label
	 *                                             parameter may be overridden.
	 * @param {Object} [imageSettings.disabled=null] The visual information about the disabled state.
	 *                                           If omitted, uses the up state.
	 * @param {createjs.Rectangle} [imageSettings.disabled.src] The sourceRect for the state within
	 *                                                      the image.
	 * @param {createjs.Rectangle} [imageSettings.disabled.trim=null] Trim data about the state,
	 *                                                            where x & y are how many pixels
	 *                                                            were trimmed off the left and
	 *                                                            right, and height & width are
	 *                                                            the untrimmed size of the
	 *                                                            button.
	 * @param {Object} [imageSettings.disabled.label=null] Label information specific to this state.
	 *                                                 Properties on this parameter override data
	 *                                                 in the label parameter for this button
	 *                                                 state only. All values except "text" from
	 *                                                 the label parameter may be overridden.
	 * @param {Object} [imageSettings.<yourCustomState>=null] The visual information about a custom
	 *                                                    state found in imageSettings.priority.
	 *                                                    Any state added this way has a property
	 *                                                    of the same name added to the button.
	 *                                                    Examples of previous states that have
	 *                                                    been moved to this system are
	 *                                                    "selected" and "highlighted".
	 * @param {createjs.Rectangle} [imageSettings.<yourCustomState>.src] The sourceRect for the state
	 *                                                               within the image.
	 * @param {createjs.Rectangle} [imageSettings.<yourCustomState>.trim=null] Trim data about the
	 *                                                                     state, where x & y are
	 *                                                                     how many pixels were
	 *                                                                     trimmed off the left
	 *                                                                     and right, and height
	 *                                                                     & width are the
	 *                                                                     untrimmed size of the
	 *                                                                     button.
	 * @param {Object} [imageSettings.<yourCustomState>.label=null] Label information specific to
	 *                                                          this state. Properties on this
	 *                                                          parameter override data in the
	 *                                                          label parameter for this button
	 *                                                          state only. All values except
	 *                                                          "text" from the label parameter
	 *                                                          may be overridden.
	 * @param {createjs.Point} [imageSettings.origin=null] An optional offset for all button
	 *                                                 graphics, in case you want button
	 *                                                 positioning to not include a highlight
	 *                                                 glow, or any other reason you would want
	 *                                                 to offset the button art and label.
	 * @param {Object} [label=null] Information about the text label on the button. Omitting this
	 *                          makes the button not use a label.
	 * @param {String} [label.text] The text to display on the label.
	 * @param {String} [label.font] The font name and size to use on the label, as createjs.Text
	 *                          expects.
	 * @param {String} [label.color] The color of the text to use on the label, as createjs.Text
	 *                           expects.
	 * @param {String} [label.textBaseline="middle"] The baseline for the label text, as
	 *                                           createjs.Text expects.
	 * @param {Object} [label.stroke=null] The stroke to use for the label text, if desired, as
	 *                                 createjs.Text (springroll fork only) expects.
	 * @param {createjs.Shadow} [label.shadow=null] A shadow object to apply to the label text.
	 * @param {String|Number} [label.x="center"] An x position to place the label text at relative to
	 *                                       the button. If omitted, "center" is used, which
	 *                                       attempts to horizontally center the label on the
	 *                                       button.
	 * @param {String|Number} [label.y="center"] A y position to place the label text at relative to
	 *                                       the button. If omitted, "center" is used, which
	 *                                       attempts to vertically center the label on the
	 *                                       button. This may be unreliable - see documentation
	 *                                       for createjs.Text.getMeasuredLineHeight().
	 * @param {Boolean} [enabled=true] Whether or not the button is initially enabled.
	 */
	var Button = function(imageSettings, label, enabled)
	{
		Debug = include('springroll.Debug', false);
		if (!imageSettings && true)
		{
			throw "springroll.easeljs.Button requires an image as the first parameter";
		}

		Container.call(this);

		/**
		 * The sprite that is the body of the button.
		 * @public
		 * @property {createjs.Bitmap} back
		 * @readOnly
		 */
		this.back = null;

		/**
		 * The text field of the button. The label is centered by both width and height on the
		 * button.
		 * @public
		 * @property {createjs.Text} label
		 * @readOnly
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
		 * The standard order previously was
		 * ["highlighted", "disabled", "down", "over", "selected", "up"].
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
		 * An offset to button positioning, generally used to adjust for a highlight around the
		 * button.
		 * @private
		 * @property {createjs.Point} _offset
		 */
		this._offset = new Point();

		//====
		//Actual constructor stuff from here on out, not just property definitions
		//====

		//input events should have this button as a target, not the child Bitmap.
		this.mouseChildren = false;

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

			//each rects object has a src property (createjs.Rectangle), and optionally a trim
			//rectangle
			var inputData, stateLabel;
			//start at the end to start at the up state
			for (i = this._statePriority.length - 1; i >= 0; --i)
			{
				state = this._statePriority[i];
				//set up the property for the state so it can be set - the function will ignore
				//reserved states
				this._addProperty(state);
				//set the default value for the state flag
				if (state != "disabled" && state != "up")
				{
					this._stateFlags[state] = false;
				}
				inputData = imageSettings[state];
				//it's established that over, down, and particularly disabled default to the up
				//state
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
						stateLabel.stroke = inputData.hasOwnProperty("stroke") ? inputData.stroke :
							labelData.stroke;
						stateLabel.shadow = inputData.hasOwnProperty("shadow") ? inputData.shadow :
							labelData.shadow;
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
				if (true && Debug)
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

	// Extend Container
	var p = extend(Button, Container);
	var s = Container.prototype; //super

	/**
	 * An event for when the button is pressed (while enabled).
	 * @static
	 * @property {String} BUTTON_PRESS
	 */
	Button.BUTTON_PRESS = "buttonPress";

	/**
	 * An event for when the button is moused over (while enabled).
	 * @static
	 * @property {String} BUTTON_OVER
	 */
	Button.BUTTON_OVER = "buttonOver";

	/**
	 * An event for when the button is moused out (while enabled).
	 * @static
	 * @property {String} BUTTON_OUT
	 */
	Button.BUTTON_OUT = "buttonOut";

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

	/*
	 * A simple function for making a shallow copy of an object.
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
	 * The width of the button, based on the width of back. This value is affected by scale.
	 * @property {Number} width
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
	 * The height of the button, based on the height of back. This value is affected by scale.
	 * @property {Number} height
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
	 * Sets the text of the label. This does nothing if the button was not initialized with a label.
	 * @public
	 * @method setText
	 * @param {String} text The text to set the label to.
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
	 * Whether or not the button is enabled.
	 * @property {Boolean} enabled
	 * @default true
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
		},
		configurable: true
	});

	/**
	 * Adds a property to the button. Setting the property sets the value in
	 * _stateFlags and calls _updateState().
	 * @private
	 * @method _addProperty
	 * @param {String} propertyName The property name to add to the button.
	 */
	p._addProperty = function(propertyName)
	{
		//check to make sure we don't add reserved names
		if (RESERVED_STATES.indexOf(propertyName) >= 0) return;

		if (true && Debug && this[propertyName] !== undefined)
		{
			Debug.error("Adding property %s to button is dangerous, as property already exists with that name!", propertyName);
		}

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
	 * Updates back based on the current button state.
	 * @private
	 * @method _updateState
	 * @return {Object} The state data for the active button state, so that subclasses can use the
	 *                  value picked by this function without needing to calculate it themselves.
	 */
	p._updateState = function()
	{
		var back = this.back;
		if (!back) return;
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
		//set up the source rect for just that button state
		back.sourceRect = data.src;
		//if the image was rotated in a TextureAtlas, account for that
		if (data.rotated)
		{
			back.rotation = -90;
			back.regX = back.sourceRect.width;
		}
		else
		{
			back.rotation = back.regX = 0;
		}
		//position the button back
		if (data.trim)
		{
			back.x = data.trim.x + this._offset.x;
			back.y = data.trim.y + this._offset.y;
		}
		else
		{
			back.x = this._offset.x;
			back.y = this._offset.y;
		}
		var label = this.label;
		//if we have a label, update that too
		if (label)
		{
			var lData = data.label;
			//update the text properties
			label.textBaseline = lData.textBaseline || "middle"; //Middle is easy to center
			label.stroke = lData.stroke;
			label.shadow = lData.shadow;
			label.font = lData.font;
			label.color = lData.color || "#000"; //default for createjs.Text
			//position the text
			if (lData.x == "center")
				label.x = (this._width - label.getMeasuredWidth()) * 0.5 + this._offset.x;
			else
				label.x = lData.x + this._offset.x;
			if (lData.y == "center")
				label.y = this._height * 0.5 + this._offset.y;
			else
				label.y = lData.y + this._offset.y;
		}
		return data;
	};

	/**
	 * The callback for when the button receives a mouse down event.
	 * @private
	 * @method _onMouseDown
	 */
	p._onMouseDown = function(e)
	{
		this.addEventListener('pressup', this._upCB);
		this.addEventListener("click", this._clickCB);
		this._stateFlags.down = true;
		this._updateState();
	};

	/**
	 * The callback for when the button for when the mouse/touch is released on the button
	 * - only when the button was held down initially.
	 * @private
	 * @method _onMouseUp
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
	 * The callback for when the button the button is clicked or tapped on. This is
	 * the most reliable way of detecting mouse up/touch end events that are on this button
	 * while letting the pressup event handle the mouse up/touch ends on and outside the button.
	 * @private
	 * @method _onClick
	 */
	p._onClick = function(e)
	{
		this.dispatchEvent(new Event(Button.BUTTON_PRESS));
	};

	/**
	 * The callback for when the button is moused over.
	 * @private
	 * @method _onMouseOver
	 */
	p._onMouseOver = function(e)
	{
		this._stateFlags.over = true;
		this._updateState();

		this.dispatchEvent(new Event(Button.BUTTON_OVER));
	};

	/**
	 * The callback for when the mouse leaves the button area.
	 * @private
	 * @method _onMouseOut
	 */
	p._onMouseOut = function(e)
	{
		this._stateFlags.over = false;
		this._updateState();

		this.dispatchEvent(new Event(Button.BUTTON_OUT));
	};

	/**
	 * Destroys the button.
	 * @public
	 * @method destroy
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
	 * Generates a desaturated up state as a disabled state, and an update with a solid colored
	 * glow for a highlighted state.
	 * @method generateDefaultStates
	 * @static
	 * @param {Image|HTMLCanvasElement} image The image to use for all of the button states, in the
	 *                                        standard up/over/down format.
	 * @param {Object} [disabledSettings] The settings object for the disabled state. If omitted, no
	 *                                    disabled state is created.
	 * @param {Number} [disabledSettings.saturation] The saturation adjustment for the disabled
	 *                                               state. 100 is fully saturated, 0 is unchanged,
	 *                                               -100 is desaturated.
	 * @param {Number} [disabledSettings.brightness] The brightness adjustment for the disabled
	 *                                               state. 100 is fully bright, 0 is unchanged,
	 *                                               -100 is completely dark.
	 * @param {Number} [disabledSettings.contrast] The contrast adjustment for the disabled state.
	 *                                             100 is full contrast, 0 is unchanged, -100 is no
	 *                                             contrast.
	 * @param {Object} [highlightSettings] The settings object for the highlight state. If omitted,
	 *                                     no state is created.
	 * @param {Number} [highlightSettings.size] How many pixels to make the glow, eg 8 for an
	 *                                          8 pixel increase on each side.
	 * @param {Number} [highlightSettings.red] The red value for the glow, from 0 to 255.
	 * @param {Number} [highlightSettings.green] The green value for the glow, from 0 to 255.
	 * @param {Number} [highlightSettings.blue] The blue value for the glow, from 0 to 255.
	 * @param {Number} [highlightSettings.alpha=255] The alpha value for the glow, from 0 to 255,
	 *                                               with 0 being transparent and 255 fully opaque.
	 * @param {Array} [highlightSettings.rgba] An array of values to use for red, green, blue, and
	 *                                         optionally alpha that can be used instead of
	 *                                         providing separate properties on highlightSettings.
	 * @return {Object} An object for use as the 'imageSettings' parameter on a new Button.
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
			{
				//convert to EaselJS's -255->255 system from -100->100
				matrix.adjustBrightness(disabledSettings.brightness * 2.55);
			}
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
			//set up the next position for the highlight state, if we have it
			nextY += buttonHeight;
			//reset any transformations
			context.restore();
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
			//reset any transformations
			context.restore();
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
			//add in an offset to the button to account for the highlight glow without affecting
			//button positioning
			output.offset = {
				x: -highlightSettings.size,
				y: -highlightSettings.size
			};
		}
		return output;
	};

	/**
	 * Generates an 'imageSettings' from a TextureAtlas, a base name for all frames, and a list
	 * of state priorities.
	 * @method generateSettingsFromAtlas
	 * @static
	 * @param {springroll.easeljs.TextureAtlas} atlas The TextureAtlas to pull all frames from.
	 * @param {String} baseName The base name for all frames in the atlas.
	 * @param {Array} statePriority The state order, as well as determining frame names in the
	 *                            atlas. Each state frame name in the atlas should be
	 *                            <code>baseName + "_" + statePriority[i]</code>.
	 */
	Button.generateSettingsFromAtlas = function(atlas, baseName, statePriority)
	{
		var output = {
			priority: statePriority
		};
		//start at the end to start at the up state
		for (var i = statePriority.length - 1; i >= 0; --i)
		{
			var frame = atlas.getFrame(baseName + "_" + statePriority[i]);
			if (!frame)
			{
				output[statePriority[i]] = output.up;
				continue;
			}
			if (!output.image)
				output.image = frame.image;
			var state = output[statePriority[i]] = {
				src: frame.frame
			};
			if (frame.rotated)
				state.rotated = true;
			if (frame.trimmed)
			{
				state.trim = new Rectangle(frame.offset.x, frame.offset.y, frame.width,
					frame.height);
			}
		}
		return output;
	};

	namespace('springroll').Button = Button;
	namespace('springroll.easeljs').Button = Button;
}());
/**
 * @module EaselJS UI
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function()
{
	var Button = include('springroll.easeljs.Button'),
		Sound;

	/**
	 * A button with audio events for click and over mouse events
	 * @class SoundButton
	 * @extends springroll.easeljs.Button
	 * @constructor
	 * @param {DOMElement|object} imageSettings The loaded image element, see springroll.easeljs.Button constructor
	 * @param {Object} [label=null] See springroll.easeljs.Button constructor
	 * @param {Boolean} [enabled=true] If the button should be enabled by default
	 * @param {String} [clickAlias="ButtonClick"] The button click audio alias
	 * @param {String} [overAlias="ButtonRollover"] The button rollover audio alias
	 */
	var SoundButton = function(imageSettings, label, enabled, clickAlias, overAlias)
	{
		Sound = include('springroll.Sound');

		/**
		 * The audio alias to use for click events
		 * @property {String} clickAlias
		 */
		this.clickAlias = clickAlias || "ButtonClick";

		/**
		 * The audio alias to use for mouse over events
		 * @property {String} overAlias
		 */
		this.overAlias = overAlias || "ButtonRollover";

		/**
		 * If the audio is enabled
		 * @property {Boolean} _audioEnabled
		 * @private
		 */
		this._audioEnabled = true;

		this._onRollover = this._onRollover.bind(this);
		this._onButtonPress = this._onButtonPress.bind(this);

		Button.call(this, imageSettings, label, enabled);

	};

	// Reference to the super prototype
	var s = Button.prototype;

	// Reference to the prototype
	var p = Button.extend(SoundButton);

	/**
	 * Handler for the BUTTON_PRESS event
	 * @method _onButtonPress
	 * @private
	 */
	p._onButtonPress = function(e)
	{
		if (this.clickAlias && this._audioEnabled)
		{
			Sound.instance.play(this.clickAlias);
		}
	};

	/**
	 * Handler for rollover event.
	 * @method _onRollover
	 * @private
	 */
	p._onRollover = function(e)
	{
		if (this.overAlias && this.enabled && this._audioEnabled)
		{
			Sound.instance.play(this.overAlias);
		}
	};

	/**
	 * If audio should be played for this button.
	 * @property {Boolean} audioEnabled
	 */
	Object.defineProperty(p, "audioEnabled",
	{
		get: function()
		{
			return this._audioEnabled;
		},
		set: function(enabled)
		{
			this._audioEnabled = enabled;
		}
	});

	Object.defineProperty(p, "enabled",
	{
		get: function()
		{
			return !this._stateFlags.disabled;
		},
		set: function(value)
		{
			this.removeEventListener('rollover', this._onRollover);
			this.removeEventListener(Button.BUTTON_PRESS, this._onButtonPress);
			// add listeners
			if (value)
			{
				this.addEventListener('rollover', this._onRollover);
				this.addEventListener(Button.BUTTON_PRESS, this._onButtonPress);
			}

			Object.getOwnPropertyDescriptor(s, 'enabled').set.call(this, value);
		}
	});

	/**
	 * Don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.removeEventListener("rollover", this._onRollover);
		this.removeEventListener(Button.BUTTON_PRESS, this._onButtonPress);
		this.audioEnabled = false;
		s.destroy.apply(this);
	};

	// Assign to namespace
	namespace('springroll').SoundButton = SoundButton;
	namespace('springroll.easeljs').SoundButton = SoundButton;

}());
/**
 * @module EaselJS UI
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function()
{
	/**
	 * Data class for the Dragmanager
	 * @class DragData
	 * @private
	 * @constructor
	 * @param {*} obj The object to drag
	 */
	var DragData = function(obj)
	{
		this.obj = obj;
		this.mouseDownObjPos = {
			x: 0,
			y: 0
		};
		this.dragOffset = new createjs.Point();
		this.mouseDownStagePos = {
			x: 0,
			y: 0
		};
	};

	// Assign to the global namespace
	namespace('springroll').DragData = DragData;
	namespace('springroll.easeljs').DragData = DragData;
}());
/**
 * @module EaselJS UI
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function()
{
	var Tween,
		Stage,
		DragData = include("springroll.easeljs.DragData"),
		Application = include("springroll.Application");

	/**
	 * Drag manager is responsible for handling the dragging of stage elements.
	 * Supports click-n-stick (click to start, move mouse, click to release) and click-n-drag (standard dragging) functionality.
	 *
	 * @class DragManager
	 * @constructor
	 * @param {PixiDisplay} display The display that this DragManager is handling objects on.
	 *                               Optionally, this parameter an be omitted and the
	 *                               Application's default display will be used.
	 * @param {function} startCallback The callback when when starting
	 * @param {function} endCallback The callback when ending
	 */
	var DragManager = function(display, startCallback, endCallback)
	{
		if (!Stage)
		{
			Tween = include('createjs.Tween', false);
			Stage = include("createjs.Stage");
		}

		if (typeof display == "function" && !endCallback)
		{
			endCallback = startCallback;
			startCallback = display;
			display = Application.instance.display;
		}

		/**
		 * The object that's being dragged, or a dictionary of DragData being dragged
		 * by id if multitouch is true.
		 * @public
		 * @readOnly
		 * @property {createjs.DisplayObject|Dictionary} draggedObj
		 */
		this.draggedObj = null;

		/**
		 * The radius in pixel to allow for dragging, or else does sticky click
		 * @public
		 * @property dragStartThreshold
		 * @default 20
		 */
		this.dragStartThreshold = 20;

		/**
		 * The position x, y of the mouse down on the stage. This is only used
		 * when multitouch is false - the DragData has it when multitouch is true.
		 * @private
		 * @property {object} mouseDownStagePos
		 */
		this.mouseDownStagePos = {
			x: 0,
			y: 0
		};

		/**
		 * The position x, y of the object when interaction with it started. If multitouch is
		 * true, then this will only be set during a drag stop callback, for the object that just
		 * stopped getting dragged.
		 * @property {object} mouseDownObjPos
		 */
		this.mouseDownObjPos = {
			x: 0,
			y: 0
		};

		/**
		 * If sticky click dragging is allowed.
		 * @public
		 * @property {Boolean} allowStickyClick
		 * @default true
		 */
		this.allowStickyClick = true;

		/**
		 * Is the move touch based
		 * @public
		 * @readOnly
		 * @property {Boolean} isTouchMove
		 * @default false
		 */
		this.isTouchMove = false;

		/**
		 * Is the drag being held on mouse down (not sticky clicking)
		 * @public
		 * @readOnly
		 * @property {Boolean} isHeldDrag
		 * @default false
		 */
		this.isHeldDrag = false;

		/**
		 * Is the drag a sticky clicking (click on a item, then mouse the mouse)
		 * @public
		 * @readOnly
		 * @property {Boolean} isStickyClick
		 * @default false
		 */
		this.isStickyClick = false;

		/**
		 * Settings for snapping.
		 *
		 * Format for snapping to a list of points:
		 * {
		 * 	mode:"points",
		 * 	dist:20,//snap when within 20 pixels/units
		 * 	points:[
		 * 		{ x: 20, y:30 },
		 * 		{ x: 50, y:10 }
		 * 	]
		 * }
		 *
		 * @public
		 * @property {Object} snapSettings
		 * @default null
		 */
		this.snapSettings = null;

		/**
		 * Reference to the stage
		 * @private
		 * @property {createjs.Stage} _theStage
		 */
		//passing stage is deprecated - we should be using the display
		if (stage instanceof Stage)
			this._theStage = display;
		else
			this._theStage = display.stage;
		/**
		 * The offset from the dragged object's position that the initial mouse event
		 * was at. This is only used when multitouch is false - the DragData has
		 * it when multitouch is true.
		 * @private
		 * @property {createjs.Point} _dragOffset
		 */
		this._dragOffset = null;

		/**
		 * The pointer id that triggered the drag. This is only used when multitouch is false
		 * - the DragData is indexed by pointer id when multitouch is true.
		 * @private
		 * @property {Number} _dragPointerID
		 */
		this._dragPointerID = 0;

		/**
		 * Callback when we start dragging
		 * @private
		 * @property {Function} _dragStartCallback
		 */
		this._dragStartCallback = startCallback;

		/**
		 * Callback when we are done dragging
		 * @private
		 * @property {Function} _dragEndCallback
		 */
		this._dragEndCallback = endCallback;

		this._triggerHeldDrag = this._triggerHeldDrag.bind(this);
		this._triggerStickyClick = this._triggerStickyClick.bind(this);
		this._stopDrag = this._stopDrag.bind(this);
		this._updateObjPosition = this._updateObjPosition.bind(this);

		/**
		 * The collection of draggable objects
		 * @private
		 * @property {Array} _draggableObjects
		 */
		this._draggableObjects = [];

		/**
		 * A point for reuse instead of lots of object creation.
		 * @private
		 * @property {createjs.Point} _helperPoint
		 */
		this._helperPoint = null;

		/**
		 * If this DragManager is using multitouch for dragging.
		 * @private
		 * @property {Boolean} _multitouch
		 */
		this._multitouch = false;
	};

	// Reference to the drag manager
	var p = extend(DragManager);

	/**
	 * If the DragManager allows multitouch dragging. Setting this stops any current
	 * drags.
	 * @property {Boolean} multitouch
	 */
	Object.defineProperty(p, "multitouch",
	{
		get: function()
		{
			return this._multitouch;
		},
		set: function(value)
		{
			if (this.draggedObj)
			{
				if (this._multitouch)
				{
					for (var id in this.draggedObj)
					{
						this._stopDrag(id, true);
					}
				}
				else
					this._stopDrag(null, true);
			}
			this._multitouch = !!value;
			this.draggedObj = value ?
			{} : null;
		}
	});

	/**
	 * Manually starts dragging an object. If a mouse down event is not
	 * supplied as the second argument, it defaults to a held drag, that ends as
	 * soon as the mouse is released. When using multitouch, passing a mouse event is
	 * required.
	 * @method startDrag
	 * @public
	 * @param {createjs.DisplayObject} object The object that should be dragged.
	 * @param {createjs.MouseEvent} ev A mouse down event that should be considered to have
	 *                                started the drag, to determine what type of drag should be
	 *                                used.
	 */
	p.startDrag = function(object, ev)
	{
		this._objMouseDown(ev, object);
	};

	/**
	 * Mouse down on an obmect
	 * @method _objMouseDown
	 * @private
	 * @param {createjs.MouseEvent} ev A mouse down event to listen to to determine
	 *                                what type of drag should be used.
	 * @param {createjs.DisplayObject} object The object that should be dragged.
	 */
	p._objMouseDown = function(ev, obj)
	{
		// if we are dragging something, then ignore any mouse downs
		// until we release the currently dragged stuff
		if ((!this._multitouch && this.draggedObj) ||
			(this._multitouch && !ev)) return;

		var dragData, mouseDownObjPos, mouseDownStagePos, dragOffset;
		if (this._multitouch)
		{
			dragData = new DragData(obj);
			this.draggedObj[ev.pointerID] = dragData;
			mouseDownObjPos = dragData.mouseDownObjPos;
			mouseDownStagePos = dragData.mouseDownStagePos;
			dragOffset = dragData.dragOffset;
		}
		else
		{
			this.draggedObj = obj;
			mouseDownObjPos = this.mouseDownObjPos;
			mouseDownStagePos = this.mouseDownStagePos;
			dragOffset = this._dragOffset = new createjs.Point();
		}
		//stop any active tweens on the object, in case it is moving around or something
		if (Tween)
			Tween.removeTweens(obj);

		if (ev)
		{
			if (obj._dragOffset)
			{
				dragOffset.x = obj._dragOffset.x;
				dragOffset.y = obj._dragOffset.y;
			}
			else
			{
				//get the mouse position in global space and convert it to parent space
				dragOffset = obj.parent.globalToLocal(ev.stageX, ev.stageY, dragOffset);
				//move the offset to respect the object's current position
				dragOffset.x -= obj.x;
				dragOffset.y -= obj.y;
			}
		}

		//save the position of the object before dragging began, for easy restoration, if desired
		mouseDownObjPos.x = obj.x;
		mouseDownObjPos.y = obj.y;

		//if we don't get an event (manual call neglected to pass one) then default to a held drag
		if (!ev)
		{
			this.isHeldDrag = true;
			this._dragPointerID = -1; //allow any touch/mouse up to stop drag
			this._startDrag();
		}
		else
		{
			//override the target for the mousedown/touchstart event to be
			//this object, in case we are dragging a cloned object
			this._theStage._getPointerData(ev.pointerID).target = obj;
			this._dragPointerID = ev.pointerID;
			//if it is a touch event, force it to be the held drag type
			if (!this.allowStickyClick || ev.nativeEvent.type == 'touchstart')
			{
				this.isTouchMove = ev.nativeEvent.type == 'touchstart';
				this.isHeldDrag = true;
				this._startDrag(ev);
			}
			//otherwise, wait for a movement or a mouse up in order to do a
			//held drag or a sticky click drag
			else
			{
				mouseDownStagePos.x = ev.stageX;
				mouseDownStagePos.y = ev.stageY;
				obj.addEventListener("pressmove", this._triggerHeldDrag);
				obj.addEventListener("pressup", this._triggerStickyClick);
			}
		}
	};

	/**
	 * Start the sticky click
	 * @method _triggerStickyClick
	 * @param {createjs.MouseEvent} ev The mouse down event
	 * @private
	 */
	p._triggerStickyClick = function(ev)
	{
		this.isStickyClick = true;
		var draggedObj = this._multitouch ? this.draggedObj[ev.pointerID].obj : this.draggedObj;
		draggedObj.removeEventListener("pressmove", this._triggerHeldDrag);
		draggedObj.removeEventListener("pressup", this._triggerStickyClick);
		this._startDrag(ev);
	};

	/**
	 * Start hold dragging
	 * @method _triggerHeldDrag
	 * @private
	 * @param {createjs.MouseEvent} ev The mouse down event
	 */
	p._triggerHeldDrag = function(ev)
	{
		this.isHeldMove = true;
		var mouseDownStagePos, draggedObj;
		if (this._multitouch)
		{
			draggedObj = this.draggedObj[ev.pointerID].obj;
			mouseDownStagePos = this.draggedObj[ev.pointerID].mouseDownStagePos;
		}
		else
		{
			draggedObj = this.draggedObj;
			mouseDownStagePos = this.mouseDownStagePos;
		}
		var xDiff = ev.stageX - mouseDownStagePos.x;
		var yDiff = ev.stageY - mouseDownStagePos.y;
		if (xDiff * xDiff + yDiff * yDiff >= this.dragStartThreshold * this.dragStartThreshold)
		{
			this.isHeldDrag = true;
			draggedObj.removeEventListener("pressmove", this._triggerHeldDrag);
			draggedObj.removeEventListener("pressup", this._triggerStickyClick);
			this._startDrag(ev);
		}
	};

	/**
	 * Internal start dragging on the stage
	 * @method _startDrag
	 * @private
	 */
	p._startDrag = function(ev)
	{
		var stage = this._theStage;
		//duplicate listeners are ignored
		stage.addEventListener("stagemousemove", this._updateObjPosition);
		stage.addEventListener("stagemouseup", this._stopDrag);

		if (ev)
		{
			this._updateObjPosition(ev);
		}

		this._dragStartCallback(this._multitouch ?
			this.draggedObj[ev.pointerID].obj :
			this.draggedObj);
	};

	/**
	 * Stops dragging the currently dragged object.
	 * @public
	 * @method stopDrag
	 * @param {Boolean} [doCallback=false] If the drag end callback should be called.
	 * @param {createjs.DisplayObject} [obj] A specific object to stop dragging, if multitouch
	 *                                     is true. If this is omitted, it stops all drags.
	 */
	p.stopDrag = function(doCallback, obj)
	{
		var id = null;
		if (this._multitouch && obj)
		{
			for (var key in this.draggedObj)
			{
				if (this.draggedObj[key].obj == obj)
				{
					id = key;
					break;
				}
			}
		}
		//pass true if it was explicitly passed to us, false and undefined -> false
		this._stopDrag(id, doCallback === true);
	};

	/**
	 * Internal stop dragging on the stage
	 * @method _stopDrag
	 * @private
	 * @param {createjs.MouseEvent} ev Mouse up event
	 * @param {Boolean} doCallback If we should do the callback
	 */
	p._stopDrag = function(ev, doCallback)
	{
		var obj, id;
		if (this._multitouch)
		{
			if (ev)
			{
				//stop a specific drag
				id = ev;
				if (ev instanceof createjs.MouseEvent)
					id = ev.pointerID;

				var data = this.draggedObj[id];
				if (!data) return;
				obj = data.obj;
				//save the position that it started at so the callback can make use of it
				//if they want
				this.mouseDownObjPos.x = data.mouseDownObjPos.x;
				this.mouseDownObjPos.y = data.mouseDownObjPos.y;
				delete this.draggedObj[id];
			}
			else
			{
				//stop all drags
				for (id in this.draggedObj)
				{
					this._stopDrag(id, doCallback);
				}
				return;
			}
		}
		else
		{
			//don't stop the drag if a different finger than the dragging one was released
			if (ev && ev.pointerID != this._dragPointerID && this._dragPointerID > -1) return;

			obj = this.draggedObj;
			this.draggedObj = null;
		}

		if (!obj) return;

		obj.removeEventListener("pressmove", this._triggerHeldDrag);
		obj.removeEventListener("pressup", this._triggerStickyClick);
		var removeGlobalListeners = !this._multitouch;
		if (this._multitouch)
		{
			//determine if this was the last drag
			var found = false;
			for (id in this.draggedObj)
			{
				found = true;
				break;
			}
			removeGlobalListeners = !found;
		}
		if (removeGlobalListeners)
		{
			this._theStage.removeEventListener("stagemousemove", this._updateObjPosition);
			this._theStage.removeEventListener("stagemouseup", this._stopDrag);
		}
		this.isTouchMove = false;
		this.isStickyClick = false;
		this.isHeldMove = false;

		if (doCallback !== false) // true or undefined
			this._dragEndCallback(obj);
	};

	/**
	 * Update the object position based on the mouse
	 * @method _updateObjPosition
	 * @private
	 * @param {createjs.MouseEvent} ev Mouse move event
	 */
	p._updateObjPosition = function(ev)
	{
		if (!ev || (!this.isTouchMove && !this._theStage.mouseInBounds)) return;

		var draggedObj, dragOffset;
		if (this._multitouch)
		{
			var data = this.draggedObj[ev.pointerID];
			if (!data) return;

			draggedObj = data.obj;
			dragOffset = data.dragOffset;
		}
		else
		{
			if (ev.pointerID != this._dragPointerID && this._dragPointerID > -1) return;

			draggedObj = this.draggedObj;
			dragOffset = this._dragOffset;
		}
		var mousePos = draggedObj.parent.globalToLocal(ev.stageX, ev.stageY, this._helperPoint);
		var bounds = draggedObj._dragBounds;
		if (bounds)
		{
			draggedObj.x = Math.clamp(mousePos.x - dragOffset.x, bounds.x, bounds.right);
			draggedObj.y = Math.clamp(mousePos.y - dragOffset.y, bounds.y, bounds.bottom);
		}
		else
		{
			draggedObj.x = mousePos.x - dragOffset.x;
			draggedObj.y = mousePos.y - dragOffset.y;
		}
		if (this.snapSettings)
		{
			switch (this.snapSettings.mode)
			{
				case "points":
					this._handlePointSnap(mousePos, dragOffset, draggedObj);
					break;
				case "grid":
					//not yet implemented
					break;
				case "line":
					//not yet implemented
					break;
			}
		}
	};

	/**
	 * Handles snapping the dragged object to the nearest among a list of points
	 * @method _handlePointSnap
	 * @private
	 * @param {createjs.Point} localMousePos The mouse position in the same
	 *                                     space as the dragged object.
	 * @param {createjs.Point} dragOffset The drag offset for the dragged object.
	 * @param {createjs.DisplayObject} obj The object to snap.
	 */
	p._handlePointSnap = function(localMousePos, dragOffset, obj)
	{
		var snapSettings = this.snapSettings;
		var minDistSq = snapSettings.dist * snapSettings.dist;
		var points = snapSettings.points;
		var objX = localMousePos.x - dragOffset.x;
		var objY = localMousePos.y - dragOffset.y;
		var leastDist = -1;
		var closestPoint = null;

		var p, distSq;
		for (var i = points.length - 1; i >= 0; --i)
		{
			p = points[i];
			distSq = Math.distSq(objX, objY, p.x, p.y);
			if (distSq <= minDistSq && (distSq < leastDist || leastDist == -1))
			{
				leastDist = distSq;
				closestPoint = p;
			}
		}
		if (closestPoint)
		{
			obj.x = closestPoint.x;
			obj.y = closestPoint.y;
		}
	};

	//=== Giving functions and properties to draggable objects objects
	var enableDrag = function(enable)
	{
		// Allow for the enableDrag(false)
		if (enable === false)
		{
			disableDrag.apply(this);
			return;
		}

		this.addEventListener("mousedown", this._onMouseDownListener);
		this.cursor = "pointer";
	};

	var disableDrag = function()
	{
		this.removeEventListener("mousedown", this._onMouseDownListener);
		this.cursor = null;
	};

	var _onMouseDown = function(ev)
	{
		this._dragMan._objMouseDown(ev, this);
	};

	/**
	 * Adds properties and functions to the object - use enableDrag() and disableDrag() on
	 * objects to enable/disable them (they start out disabled). Properties added to objects:
	 * _dragBounds (Rectangle), _dragOffset (Point), _onMouseDownListener (Function),
	 * _dragMan (springroll.DragManager) reference to the DragManager
	 * these will override any existing properties of the same name
	 * @method addObject
	 * @public
	 * @param {createjs.DisplayObject} obj The display object
	 * @param {createjs.Rectangle} [bounds] The rectangle bounds. 'right' and 'bottom' properties
	 *                                    will be added to this object.
	 * @param {createjs.Point} [dragOffset] A specific drag offset to use each time, instead of
	 *                                      the mousedown/touchstart position relative to the
	 *                                      object. This is useful if you want something to always
	 *                                      be dragged from a specific position, like the base of
	 *                                      a torch.
	 */
	p.addObject = function(obj, bounds, dragOffset)
	{
		if (bounds)
		{
			bounds.right = bounds.x + bounds.width;
			bounds.bottom = bounds.y + bounds.height;
		}
		obj._dragBounds = bounds;
		obj._dragOffset = dragOffset || null;
		if (this._draggableObjects.indexOf(obj) >= 0)
		{
			//don't change any of the functions or anything, just quit the function after having updated the bounds
			return;
		}
		obj.enableDrag = enableDrag;
		obj.disableDrag = disableDrag;
		obj._onMouseDownListener = _onMouseDown.bind(obj);
		obj._dragMan = this;
		this._draggableObjects.push(obj);
	};

	/**
	 * Removes properties and functions added by addObject().
	 * @public
	 * @method removeObject
	 * @param {createjs.DisplayObject} obj The display object
	 */
	p.removeObject = function(obj)
	{
		if (!obj.disableDrag) return;

		obj.disableDrag();
		delete obj.enableDrag;
		delete obj.disableDrag;
		delete obj._onMouseDownListener;
		delete obj._dragMan;
		delete obj._dragBounds;
		delete obj._dragOffset;
		var index = this._draggableObjects.indexOf(obj);
		if (index >= 0)
			this._draggableObjects.splice(index, 1);
	};

	/**
	 * Destroy the manager
	 * @public
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.stopDrag(false);
		this.draggedObj = null;
		this._updateObjPosition = null;
		this._dragStartCallback = null;
		this._dragEndCallback = null;
		this._triggerHeldDrag = null;
		this._triggerStickyClick = null;
		this._stopDrag = null;
		this._theStage = null;

		var obj;
		for (var i = this._draggableObjects.length - 1; i >= 0; --i)
		{
			obj = this._draggableObjects[i];
			obj.disableDrag();
			delete obj.enableDrag;
			delete obj.disableDrag;
			delete obj._onMouseDownListener;
			delete obj._dragMan;
			delete obj._dragBounds;
			delete obj._dragOffset;
		}
		this._draggableObjects = null;
		this._helperPoint = null;
	};

	// Assign to the global namespace
	namespace('springroll').DragManager = DragManager;
	namespace('springroll.easeljs').DragManager = DragManager;
}());