/**
 * @module EaselJS Interface
 * @namespace springroll.easeljs
 * @requires  Core, EaselJS Display
 */
(function()
{
	var Button = include('springroll.easeljs.Button'),
		Sound;

	/**
	 *  A button with audio events for click and over mouse events
	 *  @class SoundButton
	 *  @extends springroll.easeljs.Button
	 *  @constructor
	 *  @param {DOMElement|object} imageSettings The loaded image element, see springroll.easeljs.Button constructor
	 *  @param {Object} [label=null] See springroll.easeljs.Button constructor
	 *  @param {Boolean} [enabled=true] If the button should be enabled by default
	 *  @param {String} [clickAlias="ButtonClick"] The button click audio alias
	 *  @param {String} [overAlias="ButtonRollover"] The button rollover audio alias
	 */
	var SoundButton = function(imageSettings, label, enabled, clickAlias, overAlias)
	{
		Sound = include('springroll.Sound');

		/**
		 *  The audio alias to use for click events
		 *  @property {String} clickAlias
		 */
		this.clickAlias = clickAlias || "ButtonClick";

		/**
		 *  The audio alias to use for mouse over events
		 *  @property {String} overAlias
		 */
		this.overAlias = overAlias || "ButtonRollover";

		/**
		 *  If the audio is enabled
		 *  @property {Boolean} _audioEnabled
		 *  @private
		 */
		this._audioEnabled = true;

		this._onRollover = this._onRollover.bind(this);
		this._onButtonPress = this._onButtonPress.bind(this);

		Button.call(this, imageSettings, label, enabled);

	};

	// Reference to the super prototype
	var s = Button.prototype;

	// Reference to the prototype
	var p = extend(SoundButton, Button);

	/**
	 *  Handler for the BUTTON_PRESS event
	 *  @method _onButtonPress
	 *  @private
	 */
	p._onButtonPress = function(e)
	{
		if (this.clickAlias && this._audioEnabled)
		{
			Sound.instance.play(this.clickAlias);
		}
	};

	/**
	 *  Handler for rollover event.
	 *  @method _onRollover
	 *  @private
	 */
	p._onRollover = function(e)
	{
		if (this.overAlias && this.enabled && this._audioEnabled)
		{
			Sound.instance.play(this.overAlias);
		}	
	};

	/**
	 *  If audio should be played for this button.
	 *  @property {Boolean} audioEnabled
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

	Object.defineProperty(p, "enabled", {
		get: function(){ return !this._stateFlags.disabled; },
		set: function(value)
		{
			this.removeEventListener('rollover', this._onRollover);
			this.removeEventListener(Button.BUTTON_PRESS, this._onButtonPress);
			// add listeners
			if(value)
			{
				this.addEventListener('rollover', this._onRollover);
				this.addEventListener(Button.BUTTON_PRESS, this._onButtonPress);
			}

			Object.getOwnPropertyDescriptor(s, 'enabled').set.call(this, value);
		}
	});

	/**
	 *  Don't use after this
	 *  @method destroy
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