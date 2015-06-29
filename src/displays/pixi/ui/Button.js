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
		Text = include('PIXI.Text');

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
	 * @param {PIXI.Texture} [imageSettings.up.tex] The sourceRect for the state within the image.
	 * @param {Object} [imageSettings.up.label=null] Label information specific to this state.
	 *                                               Properties on this parameter override data in
	 *                                               the label parameter for this button state
	 *                                               only. All values except "text" and "type" from
	 *                                               the label parameter may be overridden.
	 * @param {Object|PIXI.Texture} [imageSettings.over=null] The texture for the over state of the
	 *                                                        button. If omitted, uses the up
	 *                                                        state.
	 * @param {PIXI.Texture} [imageSettings.over.tex] The sourceRect for the state within the
	 *                                                image.
	 * @param {Object} [imageSettings.over.label=null] Label information specific to this state.
	 *                                                 Properties on this parameter override data
	 *                                                 in the label parameter for this button state
	 *                                                 only. All values except "text" and "type"
	 *                                                 from the label parameter may be overridden.
	 * @param {Object|PIXI.Texture} [imageSettings.down=null] The texture for the down state of the
	 *                                                        button. If omitted, uses the up
	 *                                                        state.
	 * @param {PIXI.Texture} [imageSettings.down.tex] The sourceRect for the state within the
	 *                                                image.
	 * @param {Object} [imageSettings.down.label=null] Label information specific to this state.
	 *                                                 Properties on this parameter override data
	 *                                                 in the label parameter for this button state
	 *                                                 only. All values except "text" and "type"
	 *                                                 from the label parameter may be overridden.
	 * @param {Object|PIXI.Texture} [imageSettings.disabled=null] The texture for the disabled
	 *                                                            state of the button. If omitted,
	 *                                                            uses the up state.
	 * @param {PIXI.Texture} [imageSettings.disabled.tex] The sourceRect for the state within
	 *                                                    the image.
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
	 * @param {PIXI.Texture} [imageSettings.<yourCustomState>.tex] The texture for the custom
	 *                                                             state.
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
		if (!imageSettings && DEBUG)
		{
			throw "springroll.pixi.Button requires image as first parameter";
		}

		Container.call(this);

		/**
		 * The sprite that is the body of the button.
		 * @property {PIXI.Sprite} back
		 * @readOnly
		 */
		this.back = new Sprite(imageSettings.up);

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
		
		//===callbacks for mouse/touch events
		/**
		 * Callback for mouse over, bound to this button.
		 * @private
		 * @property {Function} _overCB
		 */
		this._overCB = null;

		/**
		 * Callback for mouse out, bound to this button.
		 * @private
		 * @property {Function} _outCB
		 */
		this._outCB = null;

		/**
		 * Callback for mouse down, bound to this button.
		 * @private
		 * @property {Function} _downCB
		 */
		this._downCB = null;

		/**
		 * Callback for mouse up, bound to this button.
		 * @private
		 * @property {Function} _upCB
		 */
		this._upCB = null;

		/**
		 * Callback for mouse up outside, bound to this button.
		 * @private
		 * @property {Function} _upOutCB
		 */
		this._upOutCB = null;
		
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
		
		this._overCB = this._onOver.bind(this);
		this._outCB = this._onOut.bind(this);
		this._downCB = this._onDown.bind(this);
		this._upCB = this._onUp.bind(this);
		this._upOutCB = this._onUpOutside.bind(this);

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
		for(var i = this._statePriority.length - 1; i >= 0; --i)
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
					_stateData[state] = {tex: inputData.tex};
				else
					_stateData[state] = {tex: inputData};
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
			if (DEBUG && Debug)
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
	var p = Button.prototype = Object.create(Container.prototype);
	
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
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	}
	
	/*
	 * The width of the button, based on the width of back. This value is affected by scale.
	 * @property {Number} width
	 */
	Object.defineProperty(p, "width", {
		get:function(){return this._width * this.scale.x;},
		set:function(value){
			this.scale.x = value / this._width;
		}
	});
	/*
	 * The height of the button, based on the height of back. This value is affected by scale.
	 * @property {Number} height
	 */
	Object.defineProperty(p, "height", {
		get:function(){return this._height * this.scale.y;},
		set:function(value){
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
			this.label.updateText();
			this.label.dirty = false;
			//position the text
			var data;
			for(var i = 0; i < this._statePriority.length; ++i)
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
				var bW = this.back.width, lW = this.label.width;
				switch(this._currentLabelStyle.align)
				{
					case "center":
						this.label.position.x = bW * 0.5;
						break;
					case "right":
						this.label.position.x = (bW - lW) * 0.5 + lW;
						break;
					default://left or null (defaults to left)
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
	Object.defineProperty(p, "enabled", {
		get: function() { return !this._stateFlags.disabled; },
		set: function(value)
		{
			this._stateFlags.disabled = !value;
			this.buttonMode = value;
			this.interactive = value;
			
			this.off("mousedown", this._downCB);
			this.off("touchstart", this._downCB);
			this.off("mouseover", this._overCB);
			this.off("mouseout", this._outCB);
			
			//make sure interaction callbacks are properly set
			if (value)
			{
				this.on("mousedown", this._downCB);
				this.on("touchstart", this._downCB);
				this.on("mouseover", this._overCB);
				this.on("mouseout", this._outCB);
			}
			else
			{
				this.off("mouseupoutside", this._upOutCB);
				this.off("touchendoutside", this._upOutCB);
				this.off("mouseup", this._upCB);
				this.off("touchend", this._upCB);
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
		
		if(DEBUG && Debug &&
			(this.hasOwnProperty(propertyName) || this.prototype.hasOwnProperty(propertyName)))
		{
			Debug.error("Adding property %s to button is dangerous, as property already exists with that name!", propertyName);
		}
		
		Object.defineProperty(this, propertyName, {
			get: function() { return this._stateFlags[propertyName]; },
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
	 */
	p._updateState = function()
	{
		if (!this.back) return;

		var data;
		//use the highest priority state
		for(var i = 0; i < this._statePriority.length; ++i)
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
		this.back.setTexture(data.tex);
		//if we have a label, update that too
		if (this.label)
		{
			data = data.label;
			//update the text style
			if (!this._currentLabelStyle || !doObjectsMatch(this._currentLabelStyle, data.style))
			{
				this.label.setStyle(data.style);
				this._currentLabelStyle = data.style;
				//make the text update so we can figure out the size for positioning
				if (this.label instanceof Text)
				{
					this.label.updateText();
					this.label.dirty = false;
				}
				else
					this.label.forceUpdateText();
			}
			//position the text
			if (data.x == "center")
			{
				var bW = this.back.width, lW = this.label.width;
				switch(this._currentLabelStyle.align)
				{
					case "center":
						this.label.position.x = bW * 0.5;
						break;
					case "right":
						this.label.position.x = (bW - lW) * 0.5 + lW;
						break;
					default://left or null (defaults to left)
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

	/*
	 * A simple function for comparing the properties of two objects
	 */
	function doObjectsMatch(obj1, obj2)
	{
		if (obj1 === obj2)
			return true;
		for(var key in obj1)
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
	p._onOver = function(data)
	{
		this._stateFlags.over = true;
		this._updateState();
		
		this.emit(Button.BUTTON_OVER);
	};
	
	/**
	 * The callback for when the mouse leaves the button area.
	 * @private
	 * @method _onOut
	 */
	p._onOut = function(data)
	{
		this._stateFlags.over = false;
		this._updateState();
		
		this.emit(Button.BUTTON_OUT);
	};
	
	/**
	 * The callback for when the button receives a mouse down event.
	 * @private
	 * @method _onDown
	 */
	p._onDown = function(data)
	{
		data.originalEvent.preventDefault();
		this._stateFlags.down = true;
		this._updateState();
		
		this.on("mouseupoutside", this._upOutCB);
		this.on("touchendoutside", this._upOutCB);
		this.on("mouseup", this._upCB);
		this.on("touchend", this._upCB);
	};
	
	/**
	 * The callback for when the button for when the mouse/touch is released on the button
	 * - only when the button was held down initially.
	 * @private
	 * @method _onUp
	 */
	p._onUp = function(data)
	{
		data.originalEvent.preventDefault();
		this._stateFlags.down = false;
		this.off("mouseupoutside", this._upOutCB);
		this.off("touchendoutside", this._upOutCB);
		this.off("mouseup", this._upCB);
		this.off("touchend", this._upCB);
		
		this._updateState();
		
		this.emit(Button.BUTTON_PRESS);
	};
	
	/**
	 * The callback for when the mouse/touch is released outside the button when the button was
	 * held down.
	 * @private
	 * @method _onUpOutside
	 */
	p._onUpOutside = function(data)
	{
		this._stateFlags.down = false;
		this.off("mouseupoutside", this._upOutCB);
		this.off("touchendoutside", this._upOutCB);
		this.off("mouseup", this._upCB);
		this.off("touchend", this._upCB);
		
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
		this._downCB = null;
		this._upCB = null;
		this._overCB = null;
		this._outCB = null;
		this._upOutCB = null;
	};
	
	namespace('springroll').Button = Button;
	namespace('springroll.pixi').Button = Button;
}());