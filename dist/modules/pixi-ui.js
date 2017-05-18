/*! SpringRoll 1.0.3 */
/**
 * @module PIXI UI
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display
 */
(function(undefined)
{
	// Import classes
	var Debug,
		Container = include('PIXI.Container'),
		Point = include('PIXI.Point'),
		Sprite = include('PIXI.Sprite'),
		BitmapText = include('PIXI.extras.BitmapText', false),
		Text = include('PIXI.Text'),
		Texture = include('PIXI.Texture');

	/**
	 * A Multipurpose button class. It is designed to have one image, and an optional text label.
	 * The button can be a normal button or a selectable button.
	 * The button functions similarly with both EaselJS and PIXI, but slightly differently in
	 * initialization and callbacks.
	 * Use the "buttonPress" and "buttonOver" events to know about button clicks and mouse overs,
	 * respectively.
	 *
	 * @class Button
	 * @extends PIXI.Container
	 * @constructor
	 * @param {Object} imageSettings Information about the art to be used for button states, as
	 *                               well as if the button is selectable or not.
	 * @param {Array} [imageSettings.priority=null] The state priority order. If omitted, defaults
	 *                                              to ["disabled", "down", "over", "up"]. Previous
	 *                                              versions of Button used a hard coded order:
	 *                                              ["highlighted", "disabled", "down", "over",
	 *                                              "selected", "up"].
	 * @param {Object|PIXI.Texture} [imageSettings.up] The texture for the up state of the button.
	 *                                                 This can be either the texture itself, or an
	 *                                                 object with 'tex' and 'label' properties.
	 * @param {PIXI.Texture|String} [imageSettings.up.tex] The texture to use for the up state. If
	 *                                                     this is a string, Texture.fromImage()
	 *                                                     will be used.
	 * @param {Object} [imageSettings.up.label=null] Label information specific to this state.
	 *                                               Properties on this parameter override data in
	 *                                               the label parameter for this button state
	 *                                               only. All values except "text" and "type" from
	 *                                               the label parameter may be overridden.
	 * @param {Object|PIXI.Texture} [imageSettings.over=null] The texture for the over state of the
	 *                                                        button. If omitted, uses the up
	 *                                                        state.
	 * @param {PIXI.Texture|String} [imageSettings.over.tex] The texture to use for the over state.
	 *                                                       If this is a string,
	 *                                                       Texture.fromImage() will be used.
	 * @param {Object} [imageSettings.over.label=null] Label information specific to this state.
	 *                                                 Properties on this parameter override data
	 *                                                 in the label parameter for this button state
	 *                                                 only. All values except "text" and "type"
	 *                                                 from the label parameter may be overridden.
	 * @param {Object|PIXI.Texture} [imageSettings.down=null] The texture for the down state of the
	 *                                                        button. If omitted, uses the up
	 *                                                        state.
	 * @param {PIXI.Texture|String} [imageSettings.down.tex] The texture to use for the down state.
	 *                                                       If this is a string,
	 *                                                       Texture.fromImage() will be used.
	 * @param {Object} [imageSettings.down.label=null] Label information specific to this state.
	 *                                                 Properties on this parameter override data
	 *                                                 in the label parameter for this button state
	 *                                                 only. All values except "text" and "type"
	 *                                                 from the label parameter may be overridden.
	 * @param {Object|PIXI.Texture} [imageSettings.disabled=null] The texture for the disabled
	 *                                                            state of the button. If omitted,
	 *                                                            uses the up state.
	 * @param {PIXI.Texture|String} [imageSettings.disabled.tex] The texture to use for the disabled
	 *                                                           state. If this is a string,
	 *                                                           Texture.fromImage() will be used.
	 * @param {Object} [imageSettings.disabled.label=null] Label information specific to this
	 *                                                     state. Properties on this parameter
	 *                                                     override data in the label parameter for
	 *                                                     this button state only. All values
	 *                                                     except "text" and "type" from the label
	 *                                                     parameter may be overridden.
	 * @param {Object|PIXI.Texture} [imageSettings.<yourCustomState>=null] The visual information
	 *                                                                     about a custom state
	 *                                                                     found in
	 *                                                                     imageSettings.priority.
	 *                                                                     Any state added this way
	 *                                                                     has a property of the
	 *                                                                     same name added to the
	 *                                                                     button. Examples of
	 *                                                                     previous states that
	 *                                                                     have been
	 *                                                                     moved to this system are
	 *                                                                     "selected" and
	 *                                                                     "highlighted".
	 * @param {PIXI.Texture|String} [imageSettings.<yourCustomState>.tex] The texture to use for
	 *                                                                    your custom state. If
	 *                                                                    this is a string,
	 *                                                                    Texture.fromImage()
	 *                                                                    will be used.
	 * @param {Object} [imageSettings.<yourCustomState>.label=null] Label information specific to
	 *                                                              this state. Properties on this
	 *                                                              parameter override data in the
	 *                                                              label parameter for this button
	 *                                                              state only. All values except
	 *                                                              "text" from the label parameter
	 *                                                              may be overridden.
	 * @param {PIXI.Point} [imageSettings.origin=null] An optional offset for all button graphics,
	 *                                                 in case you want button positioning to not
	 *                                                 include a highlight glow, or any other
	 *                                                 reason you would want to offset the button
	 *                                                 art and label.
	 * @param {Number} [imageSettings.scale=1] The scale to use for the textures. This allows
	 *                                         smaller art assets than the designed size to be
	 *                                         used.
	 * @param {Object} [label=null] Information about the text label on the button. Omitting this
	 *                              makes the button not use a label.
	 * @param {String} [label.type] If label.type is "bitmap", then a PIXI.extras.BitmapText text
	 *                              is created, otherwise a PIXI.Text is created for the label.
	 * @param {String} [label.text] The text to display on the label.
	 * @param {Object} [label.style] The style of the text field, in the format that
	 *                               PIXI.extras.BitmapText and PIXI.Text expect.
	 * @param {String|Number} [label.x="center"] An x position to place the label text at relative
	 *                                           to the button.
	 * @param {String|Number} [label.y="center"] A y position to place the label text at relative
	 *                                           to the button. If omitted, "center" is used, which
	 *                                           attempts to vertically center the label on the
	 *                                           button.
	 * @param {Boolean} [enabled=true] Whether or not the button is initially enabled.
	 */
	var Button = function(imageSettings, label, enabled)
	{
		Debug = include('springroll.Debug', false);
		if (!imageSettings && true)
		{
			throw "springroll.pixi.Button requires image as first parameter";
		}

		Container.call(this);

		/**
		 * The sprite that is the body of the button.
		 * @property {PIXI.Sprite} back
		 * @readOnly
		 */
		this.back = new Sprite();

		/**
		 * The text field of the button. The label is centered by both width and height on the
		 * button.
		 * @property {PIXI.Text|PIXI.BitmapText} label
		 * @readOnly
		 */
		this.label = null;

		/**
		 * A dictionary of state booleans, keyed by state name.
		 * @private
		 * @property {Object} _stateFlags
		 */
		this._stateFlags = {};

		/**
		 * An array of state names (Strings), in their order of priority.
		 * The standard order previously was ["highlighted", "disabled", "down", "over",
		 * "selected", "up"].
		 * @private
		 * @property {Array} _statePriority
		 */
		this._statePriority = imageSettings.priority || DEFAULT_PRIORITY;

		/**
		 * A dictionary of state graphic data, keyed by state name.
		 * Each object contains the sourceRect (src) and optionally 'trim', another Rectangle.
		 * Additionally, each object will contain a 'label' object if the button has a text label.
		 * @private
		 * @property {Object} _stateData
		 */
		this._stateData = null;

		/**
		 * The current style for the label, to avoid setting this if it is unchanged.
		 * @private
		 * @property {Object} _currentLabelStyle
		 */
		this._currentLabelStyle = null;

		/**
		 * An offset to button positioning, generally used to adjust for a highlight
		 * around the button.
		 * @private
		 * @property {PIXI.Point} _offset
		 */
		this._offset = new Point();

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

		this.addChild(this.back);

		this._onOver = this._onOver.bind(this);
		this._onOut = this._onOut.bind(this);
		this._onDown = this._onDown.bind(this);
		this._onUp = this._onUp.bind(this);
		this._onUpOutside = this._onUpOutside.bind(this);
		this._emitPress = this._emitPress.bind(this);

		var _stateData = this._stateData = {};

		//a clone of the label data to use as a default value, without changing the original
		var labelData;
		if (label)
		{
			labelData = clone(label);
			delete labelData.text;
			delete labelData.type;
			if (labelData.x === undefined)
				labelData.x = "center";
			if (labelData.y === undefined)
				labelData.y = "center";
			//clone the style object and set up the defaults from PIXI.Text or PIXI.BitmapText
			var style = labelData.style = clone(label.style);
			if (label.type == "bitmap")
			{
				style.align = style.align || "left";
			}
			else
			{
				style.font = style.font || "bold 20pt Arial";
				style.fill = style.fill || "black";
				style.align = style.align || "left";
				style.stroke = style.stroke || "black";
				style.strokeThickness = style.strokeThickness || 0;
				style.wordWrap = style.wordWrap || false;
				style.wordWrapWidth = style.wordWrapWidth || 100;
			}
		}

		//start at the end to start at the up state
		for (var i = this._statePriority.length - 1; i >= 0; --i)
		{
			var state = this._statePriority[i];
			//set up the property for the state so it can be set
			// - the function will ignore reserved states
			this._addProperty(state);
			//set the default value for the state flag
			if (state != "disabled" && state != "up")
				this._stateFlags[state] = false;
			var inputData = imageSettings[state];

			if (inputData)
			{
				//if inputData is an object with a tex property, use that
				//otherwise it is a texture itself
				if (inputData.tex)
					_stateData[state] = {
						tex: inputData.tex
					};
				else
					_stateData[state] = {
						tex: inputData
					};
				if (typeof _stateData[state].tex == "string")
					_stateData[state].tex = Texture.fromImage(_stateData[state].tex);
			}
			else
			{
				//it's established that over, down, and particularly disabled default to
				//the up state
				_stateData[state] = _stateData.up;
			}
			//set up the label info for this state
			if (label)
			{
				//if there is actual label data for this state, use that
				if (inputData && inputData.label)
				{
					inputData = inputData.label;
					var stateLabel = _stateData[state].label = {};
					stateLabel.style = inputData.style || labelData.style;
					stateLabel.x = inputData.x || labelData.x;
					stateLabel.y = inputData.y || labelData.y;
				}
				//otherwise use the default
				else
					_stateData[state].label = labelData;
			}
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
			_stateData.over = _stateData.up;
		if (!_stateData.down)
			_stateData.down = _stateData.up;
		if (!_stateData.disabled)
			_stateData.disabled = _stateData.up;
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

		if (imageSettings.scale)
		{
			var s = imageSettings.scale || 1;
			this.back.scale.x = this.back.scale.y = s;
		}

		if (label)
		{
			this.label = (label.type == "bitmap" && BitmapText) ?
				new BitmapText(label.text, labelData.style) :
				new Text(label.text, labelData.style);
			this.label.setPivotToAlign = true;
			this.addChild(this.label);
		}

		this.back.x = this._offset.x;
		this.back.y = this._offset.y;

		this._width = this.back.width;
		this._height = this.back.height;

		this.enabled = enabled === undefined ? true : !!enabled;
	};

	// Reference to the prototype
	var p = extend(Button, Container);

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
		for (var attr in obj)
		{
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	}

	/*
	 * The width of the button, based on the width of back. This value is affected by scale.
	 * @property {Number} width
	 */
	Object.defineProperty(p, "width",
	{
		get: function()
		{
			return this._width * this.scale.x;
		},
		set: function(value)
		{
			this.scale.x = value / this._width;
		}
	});
	/*
	 * The height of the button, based on the height of back. This value is affected by scale.
	 * @property {Number} height
	 */
	Object.defineProperty(p, "height",
	{
		get: function()
		{
			return this._height * this.scale.y;
		},
		set: function(value)
		{
			this.scale.y = value / this._height;
		}
	});

	/**
	 * Sets the text of the label. This does nothing if the button was not initialized with a
	 * label.
	 * @method setText
	 * @param {String} text The text to set the label to.
	 */
	p.setText = function(text)
	{
		if (this.label)
		{
			this.label.text = text;
			//make the text update so we can figure out the size for positioning
			if (this.label instanceof Text)
				this.label.updateText();
			else
				this.label.validate();
			//position the text
			var data;
			for (var i = 0; i < this._statePriority.length; ++i)
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
			{
				var bW = this.back.width,
					lW = this.label.width;
				switch (this._currentLabelStyle.align)
				{
					case "center":
						this.label.position.x = bW * 0.5;
						break;
					case "right":
						this.label.position.x = bw - (bW - lW) * 0.5;
						break;
					default: //left or null (defaults to left)
						this.label.position.x = (bW - lW) * 0.5;
						break;
				}
			}
			else
				this.label.position.x = data.x + this._offset.x;
			if (data.y == "center")
			{
				this.label.position.y = (this.back.height - this.label.height) * 0.5;
			}
			else
				this.label.position.y = data.y + this._offset.y;
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
			this.buttonMode = value;
			this.interactive = value;

			this.off("mousedown", this._onDown);
			this.off("touchstart", this._onDown);
			this.off("mouseover", this._onOver);
			this.off("mouseout", this._onOut);

			//make sure interaction callbacks are properly set
			if (value)
			{
				this.on("mousedown", this._onDown);
				this.on("touchstart", this._onDown);
				this.on("mouseover", this._onOver);
				this.on("mouseout", this._onOut);
			}
			else
			{
				this.off("mouseupoutside", this._onUpOutside);
				this.off("touchendoutside", this._onUpOutside);
				this.off("mouseup", this._onUp);
				this.off("touchend", this._onUp);
				this._stateFlags.down = this._stateFlags.over = false;
				//also turn off pixi values so that re-enabling button works properly
				this._over = false;
				this._touchDown = false;
			}

			this._updateState();
		}
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
		if (!this.back) return;

		var data;
		//use the highest priority state
		for (var i = 0; i < this._statePriority.length; ++i)
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
		this.back.texture = data.tex;
		//if we have a label, update that too
		if (this.label)
		{
			var lData = data.label;
			var label = this.label;
			//update the text style
			if (!this._currentLabelStyle || !doObjectsMatch(this._currentLabelStyle, lData.style))
			{
				label.font = lData.style.font;
				label.align = lData.style.align;
				this._currentLabelStyle = lData.style;
				//make the text update so we can figure out the size for positioning
				if (label instanceof Text)
					label.updateText();
				else
					label.validate();
			}
			//position the text
			if (lData.x == "center")
			{
				var bW = this.back.width,
					lW = label.width;
				switch (this._currentLabelStyle.align)
				{
					case "center":
						label.position.x = bW * 0.5;
						break;
					case "right":
						label.position.x = bW - (bW - lW) * 0.5;
						break;
					default: //left or null (defaults to left)
						label.position.x = (bW - lW) * 0.5;
						break;
				}
			}
			else
				label.position.x = lData.x + this._offset.x;
			if (lData.y == "center")
			{
				label.position.y = (this.back.height - label.height) * 0.5;
			}
			else
				label.position.y = lData.y + this._offset.y;
		}
		return data;
	};

	/*
	 * A simple function for comparing the properties of two objects
	 */
	function doObjectsMatch(obj1, obj2)
	{
		if (obj1 === obj2)
			return true;
		for (var key in obj1)
		{
			if (obj1[key] != obj2[key])
				return false;
		}
		return true;
	}

	/**
	 * The callback for when the button is moused over.
	 * @private
	 * @method _onOver
	 */
	p._onOver = function(event)
	{
		this._stateFlags.over = true;
		this._updateState();

		this.emit(Button.BUTTON_OVER, this);
	};

	/**
	 * The callback for when the mouse leaves the button area.
	 * @private
	 * @method _onOut
	 */
	p._onOut = function(event)
	{
		this._stateFlags.over = false;
		this._updateState();

		this.emit(Button.BUTTON_OUT, this);
	};

	/**
	 * The callback for when the button receives a mouse down event.
	 * @private
	 * @method _onDown
	 */
	p._onDown = function(event)
	{
		this._stateFlags.down = true;
		this._updateState();

		this.on("mouseupoutside", this._onUpOutside);
		this.on("touchendoutside", this._onUpOutside);
		this.on("mouseup", this._onUp);
		this.on("touchend", this._onUp);
	};

	/**
	 * The callback for when the button for when the mouse/touch is released on the button
	 * - only when the button was held down initially.
	 * @private
	 * @method _onUp
	 */
	p._onUp = function(event)
	{
		this._stateFlags.down = false;
		this.off("mouseupoutside", this._onUpOutside);
		this.off("touchendoutside", this._onUpOutside);
		this.off("mouseup", this._onUp);
		this.off("touchend", this._onUp);

		this._updateState();

		//because of the way PIXI handles interaction, it is safer to emit this event outside
		//the interaction check, in case the user's callback modifies the display list
		setTimeout(this._emitPress, 0);
	};

	p._emitPress = function()
	{
		this.emit(Button.BUTTON_PRESS, this);
	};

	/**
	 * The callback for when the mouse/touch is released outside the button when the button was
	 * held down.
	 * @private
	 * @method _onUpOutside
	 */
	p._onUpOutside = function(event)
	{
		this._stateFlags.down = false;
		this.off("mouseupoutside", this._onUpOutside);
		this.off("touchendoutside", this._onUpOutside);
		this.off("mouseup", this._onUp);
		this.off("touchend", this._onUp);

		this._updateState();
	};

	/**
	 * Destroys the button.
	 * @public
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.removeAllListeners();
		this.removeChildren();
		this.label = null;
		this.back = null;
		this._stateData = null;
		this._stateFlags = null;
		this._statePriority = null;
	};

	namespace('springroll').Button = Button;
	namespace('springroll.pixi').Button = Button;
}());
/**
 * @module PIXI UI
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display
 */
(function()
{
	/**
	 * The data for the drag manager
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
		this.dragOffset = new PIXI.Point();
		this.mouseDownStagePos = {
			x: 0,
			y: 0
		};
	};

	// Assign to the global namespace 
	namespace('springroll').DragData = DragData;
	namespace('springroll.pixi').DragData = DragData;
}());
/**
 * @module PIXI UI
 * @namespace springroll.pixi
 * @requires  Core, PIXI Display
 */
(function()
{

	var Application,
		Tween,
		Point,
		DragData = include("springroll.pixi.DragData");

	/**
	 * Drag manager is responsible for handling the dragging of stage elements
	 * supports click-n-stick and click-n-drag functionality.
	 *
	 * @class DragManager
	 * @constructor
	 *  @param {PixiDisplay} display The display that this DragManager is handling objects on.
	 *                               Optionally, this parameter can be omitted and the Application's
	 *                               default display will be used.
	 *  @param {Function} startCallback The callback when when starting
	 *  @param {Function} endCallback The callback when ending
	 */
	var DragManager = function(display, startCallback, endCallback)
	{
		if (!Application)
		{
			Application = include('springroll.Application');
			Tween = include('createjs.Tween', false);
			Point = include('PIXI.Point');
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
		 * @property {PIXI.DisplayObject|Dictionary} draggedObj
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
		 * @property {PIXI.Point} mouseDownStagePos
		 */
		this.mouseDownStagePos = new Point(0, 0);

		/**
		 * The position x, y of the object when interaction with it started. If multitouch is
		 * true, then this will only be set during a drag stop callback, for the object that just
		 * stopped getting dragged.
		 * @property {PIXI.Point} mouseDownObjPos
		 */
		this.mouseDownObjPos = new Point(0, 0);

		/**
		 * If sticky click dragging is allowed.
		 * @public
		 * @property {Bool} allowStickyClick
		 * @default true
		 */
		this.allowStickyClick = true;

		/**
		 * Is the move touch based
		 * @public
		 * @readOnly
		 * @property {Bool} isTouchMove
		 * @default false
		 */
		this.isTouchMove = false;

		/**
		 * Is the drag being held on mouse down (not sticky clicking)
		 * @public
		 * @readOnly
		 * @property {Bool} isHeldDrag
		 * @default false
		 */
		this.isHeldDrag = false;

		/**
		 * Is the drag a sticky clicking (click on a item, then mouse the mouse)
		 * @public
		 * @readOnly
		 * @property {Bool} isStickyClick
		 * @default false
		 */
		this.isStickyClick = false;

		/**
		 * Settings for snapping.
		 *
		 * Format for snapping to a list of points:
		 *	{
		 *		mode:"points",
		 *		dist:20,//snap when within 20 pixels/units
		 *		points:[
		 *			{ x: 20, y:30 },
		 *			{ x: 50, y:10 }
		 *		]
		 *	}
		 *
		 * @public
		 * @property {Object} snapSettings
		 * @default null
		 */
		this.snapSettings = null;

		/**
		 * Reference to the Pixi InteractionManager.
		 * @private
		 * @property {PIXI.interaction.InteractionManager} _interaction
		 */
		this._interaction = display.renderer.plugins.interaction;

		/**
		 * The offset from the dragged object's position that the initial mouse event
		 * was at. This is only used when multitouch is false - the DragData has
		 * it when multitouch is true.
		 * @private
		 * @property {PIXI.Point} _dragOffset
		 */
		this._dragOffset = null;

		/**
		 * External callback when we start dragging
		 * @private
		 * @property {Function} _dragStartCallback
		 */
		this._dragStartCallback = startCallback;

		/**
		 * External callback when we are done dragging
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
		 * If this DragManager is using multitouch for dragging.
		 * @private
		 * @property {Boolean} _multitouch
		 */
		this._multitouch = false;

		/**
		 * If this DragManager has added drag listeners to the InteractionManager
		 * @private
		 * @property {Boolean} _addedDragListeners
		 */
		this._addedDragListeners = false;

		this.helperPoint = new Point(0, 0);
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
	 * Manually starts dragging an object. If a mouse down event is not supplied
	 * as the second argument, it defaults to a held drag, that ends as soon as
	 * the mouse is released. When using multitouch, passing a interaction data is
	 * required.
	 * @method startDrag
	 * @public
	 * @param {PIXI.DisplayObject} object The object that should be dragged.
	 * @param {PIXI.InteractionData} interactionData The interaction data about
	 *                                            the input event that triggered this.
	 */
	p.startDrag = function(object, interactionData)
	{
		this._objMouseDown(object, interactionData);
	};

	/**
	 * Mouse down on an object
	 * @method _objMouseDown
	 * @private
	 * @param {PIXI.DisplayObject} object The object that should be dragged.
	 * @param {PIXI.InteractionData} interactionData The interaction data about
	 *                                            the input event that triggered this.
	 */
	p._objMouseDown = function(obj, interactionData)
	{
		//get the InteractionData we want from the Pixi v3 events
		if (interactionData.data && interactionData.data.global)
			interactionData = interactionData.data;
		// if we are dragging something, then ignore any mouse downs
		// until we release the currently dragged stuff
		if ((!this._multitouch && this.draggedObj) ||
			(this._multitouch && !interactionData)) return;

		var dragData, mouseDownObjPos, mouseDownStagePos, dragOffset;
		if (this._multitouch)
		{
			dragData = new DragData(obj);
			this.draggedObj[interactionData.identifier] = dragData;
			mouseDownObjPos = dragData.mouseDownObjPos;
			mouseDownStagePos = dragData.mouseDownStagePos;
			dragOffset = dragData.dragOffset;
		}
		else
		{
			this.draggedObj = obj;
			mouseDownObjPos = this.mouseDownObjPos;
			mouseDownStagePos = this.mouseDownStagePos;
			dragOffset = this._dragOffset = new Point();
		}
		//Stop any tweens on the object (mostly the position)
		if (Tween)
		{
			Tween.removeTweens(obj);
			Tween.removeTweens(obj.position);
		}

		if (obj._dragOffset)
		{
			dragOffset.x = obj._dragOffset.x;
			dragOffset.y = obj._dragOffset.y;
		}
		else
		{
			//get the mouse position and convert it to object parent space
			interactionData.getLocalPosition(obj.parent, dragOffset);

			//move the offset to respect the object's current position
			dragOffset.x -= obj.position.x;
			dragOffset.y -= obj.position.y;
		}

		mouseDownObjPos.x = obj.position.x;
		mouseDownObjPos.y = obj.position.y;

		//if we don't get an event (manual call neglected to pass one) then default to a held drag
		if (!interactionData)
		{
			this.isHeldDrag = true;
			this._startDrag();
		}
		else
		{
			mouseDownStagePos.x = interactionData.global.x;
			mouseDownStagePos.y = interactionData.global.y;
			//if it is a touch event, force it to be the held drag type
			if (!this.allowStickyClick || interactionData.originalEvent.type == "touchstart")
			{
				this.isTouchMove = interactionData.originalEvent.type == "touchstart";
				this.isHeldDrag = true;
				this._startDrag(interactionData);
			}
			//otherwise, wait for a movement or a mouse up in order to do a
			//held drag or a sticky click drag
			else
			{
				this._interaction.on("stagemove", this._triggerHeldDrag);
				this._interaction.on("stageup", this._triggerStickyClick);
			}
		}
	};

	/**
	 * Start the sticky click
	 * @method _triggerStickyClick
	 * @param {PIXI.InteractionData} interactionData The interaction data about
	 *                                            the input event that triggered this.
	 * @private
	 */
	p._triggerStickyClick = function(interactionData)
	{
		//get the InteractionData we want from the Pixi v3 events
		interactionData = interactionData.data;
		this.isStickyClick = true;
		var draggedObj = this._multitouch ?
			this.draggedObj[interactionData.identifier].obj :
			this.draggedObj;
		this._interaction.off("stagemove", this._triggerHeldDrag);
		this._interaction.off("stageup", this._triggerStickyClick);
		this._startDrag(interactionData);
	};

	/**
	 * Start hold dragging
	 * @method _triggerHeldDrag
	 * @private
	 * @param {PIXI.InteractionData} interactionData The ineraction data about the moved mouse
	 */
	p._triggerHeldDrag = function(interactionData)
	{
		//get the InteractionData we want from the Pixi v3 events
		interactionData = interactionData.data;
		var mouseDownStagePos, draggedObj;
		if (this._multitouch)
		{
			draggedObj = this.draggedObj[interactionData.identifier].obj;
			mouseDownStagePos = this.draggedObj[interactionData.identifier].mouseDownStagePos;
		}
		else
		{
			draggedObj = this.draggedObj;
			mouseDownStagePos = this.mouseDownStagePos;
		}
		var xDiff = interactionData.global.x - mouseDownStagePos.x;
		var yDiff = interactionData.global.y - mouseDownStagePos.y;
		if (xDiff * xDiff + yDiff * yDiff >= this.dragStartThreshold * this.dragStartThreshold)
		{
			this.isHeldDrag = true;
			this._interaction.off("stagemove", this._triggerHeldDrag);
			this._interaction.off("stageup", this._triggerStickyClick);
			this._startDrag(interactionData);
		}
	};

	/**
	 * Internal start dragging on the stage
	 * @method _startDrag
	 * @param {PIXI.InteractionData} interactionData The ineraction data about the moved mouse
	 * @private
	 */
	p._startDrag = function(interactionData)
	{
		var draggedObj;
		if (this._multitouch)
			draggedObj = this.draggedObj[interactionData.identifier].obj;
		else
			draggedObj = this.draggedObj;

		this._updateObjPosition(
		{
			data: interactionData
		});

		if (!this._addedDragListeners)
		{
			this._addedDragListeners = true;
			this._interaction.on("stagemove", this._updateObjPosition);
			this._interaction.on("stageup", this._stopDrag);
		}

		this._dragStartCallback(draggedObj);
	};

	/**
	 * Stops dragging the currently dragged object.
	 * @public
	 * @method stopDrag
	 * @param {Bool} [doCallback=false] If the drag end callback should be called.
	 * @param {PIXI.DisplayObject} [obj] A specific object to stop dragging, if multitouch
	 *                                   is true. If this is omitted, it stops all drags.
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
	 * @param {PIXI.InteractionData} interactionData The ineraction data about the moved mouse
	 * @param {Bool} doCallback If we should do the callback
	 */
	p._stopDrag = function(interactionData, doCallback)
	{
		var obj, id = null;
		//if touch id was passed directly
		if (typeof interactionData == "number")
			id = interactionData;
		else if (interactionData)
		{
			//get the InteractionData we want from the Pixi v3 events
			if (interactionData.data && interactionData.data.global)
				id = interactionData.data.identifier;
			else if (interactionData instanceof PIXI.interaction.InteractionData)
				id = interactionData.identifier;
		}
		if (this._multitouch)
		{
			if (id !== null)
			{
				//stop a specific drag
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
			obj = this.draggedObj;
			this.draggedObj = null;
		}

		if (!obj) return;

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
		if (removeGlobalListeners && this._addedDragListeners)
		{
			this._addedDragListeners = false;
			this._interaction.off("stagemove", this._updateObjPosition);
			this._interaction.off("stageup", this._stopDrag);
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
	 * @param {PIXI.InteractionData} interactionData Mouse move event
	 */
	p._updateObjPosition = function(interactionData)
	{
		//get the InteractionData we want from the Pixi v3 events
		interactionData = interactionData.data;

		//if(!this.isTouchMove && !this._theStage.interactionManager.mouseInStage) return;

		var draggedObj, dragOffset;
		if (this._multitouch)
		{
			var data = this.draggedObj[interactionData.identifier];
			draggedObj = data.obj;
			dragOffset = data.dragOffset;
		}
		else
		{
			draggedObj = this.draggedObj;
			dragOffset = this._dragOffset;
		}

		if (!draggedObj || !draggedObj.parent) //not quite sure what chain of events would lead to this, but we'll stop dragging to be safe
		{
			this.stopDrag(false, draggedObj);
			return;
		}

		var mousePos = interactionData.getLocalPosition(draggedObj.parent, this.helperPoint);
		var bounds = draggedObj._dragBounds;
		if (bounds)
		{
			draggedObj.position.x = Math.clamp(mousePos.x - dragOffset.x, bounds.x, bounds.right);
			draggedObj.position.y = Math.clamp(mousePos.y - dragOffset.y, bounds.y, bounds.bottom);
		}
		else
		{
			draggedObj.position.x = mousePos.x - dragOffset.x;
			draggedObj.position.y = mousePos.y - dragOffset.y;
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
	 * @param {PIXI.Point} localMousePos The mouse position in the same space as the dragged object.
	 * @param {PIXI.Point} dragOffset The drag offset for the dragged object.
	 * @param {PIXI.DisplayObject} obj The object to snap.
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
		for (var i = points.length - 1; i >= 0; --i)
		{
			var p = points[i];
			var distSq = Math.distSq(objX, objY, p.x, p.y);
			if (distSq <= minDistSq && (distSq < leastDist || leastDist == -1))
			{
				leastDist = distSq;
				closestPoint = p;
			}
		}
		if (closestPoint)
		{
			draggedObj.position.x = closestPoint.x;
			draggedObj.position.y = closestPoint.y;
		}
	};

	//=== Giving functions and properties to draggable objects objects
	var enableDrag = function()
	{
		this.on("touchstart", this._onMouseDownListener);
		this.on("mousedown", this._onMouseDownListener);
		this.buttonMode = this.interactive = true;
	};

	var disableDrag = function()
	{
		this.off("touchstart", this._onMouseDownListener);
		this.off("mousedown", this._onMouseDownListener);
		this.buttonMode = this.interactive = false;
	};

	var _onMouseDown = function(mouseData)
	{
		this._dragMan._objMouseDown(this, mouseData);
	};

	/**
	 * Adds properties and functions to the object - use enableDrag() and disableDrag() on
	 * objects to enable/disable them (they start out disabled). Properties added to objects:
	 * _dragBounds (Rectangle), _dragOffset (Point), _onMouseDownListener (Function),
	 * _dragMan (springroll.DragManager) reference to the DragManager
	 * these will override any existing properties of the same name
	 * @method addObject
	 * @public
	 * @param {PIXI.DisplayObject} obj The display object
	 * @param {PIXI.Rectangle} [bounds] The rectangle bounds. 'right' and 'bottom' properties
	 *                                  will be added to this object.
	 * @param {PIXI.Point} [dragOffset] A specific drag offset to use each time, instead of
	 *                                  the mousedown/touchstart position relative to the
	 *                                  object. This is useful if you want something to always
	 *                                  be dragged from a specific position, like the base of
	 *                                  a torch.
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
	 * @param {PIXI.DisplayObject} obj The display object
	 */
	p.removeObject = function(obj)
	{
		var index = this._draggableObjects.indexOf(obj);
		if (index >= 0)
		{
			obj.disableDrag();
			delete obj.enableDrag;
			delete obj.disableDrag;
			delete obj._onMouseDownListener;
			delete obj._dragMan;
			delete obj._dragBounds;
			delete obj._dragOffset;
			this._draggableObjects.splice(index, 1);
		}
	};

	/**
	 * Destroy the manager
	 * @public
	 * @method destroy
	 */
	p.destroy = function()
	{
		//clean up dragged obj
		this.stopDrag(false);

		this._updateObjPosition = null;
		this._dragStartCallback = null;
		this._dragEndCallback = null;
		this._triggerHeldDrag = null;
		this._triggerStickyClick = null;
		this._stopDrag = null;
		this._interaction = null;
		for (var i = this._draggableObjects.length - 1; i >= 0; --i)
		{
			var obj = this._draggableObjects[i];
			obj.disableDrag();
			delete obj.enableDrag;
			delete obj.disableDrag;
			delete obj._onMouseDownListener;
			delete obj._dragMan;
			delete obj._dragBounds;
			delete obj._dragOffset;
		}
		this._draggableObjects = null;
	};

	// Assign to the global namespace
	namespace('springroll').DragManager = DragManager;
	namespace('springroll.pixi').DragManager = DragManager;
}());