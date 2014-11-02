/**
*  @module CreateJS Display
*  @namespace springroll.createjs
*/
(function(){

	// Imports
	var Animator = include('springroll.createjs.Animator');
	
	/**
	*   Character Controller class is designed to play animated
	*   sequences on the timeline. This is a flexible way to
	*   animate characters on a timeline
	*   
	*   @class CharacterController
	*/
	var CharacterController = function()
	{
		/**
		* The current stack of animations to play
		*
		* @property {Array} _animationStack
		* @private
		*/
		this._animationStack = [];
		
		/**
		* The currently playing animation 
		* 
		* @property {CharacterClip} _currentAnimation
		* @private
		*/
		this._currentAnimation = null;
		
		/**
		* Current number of loops for the current animation
		* 
		* @property {int} _loops
		* @private
		*/
		this._loops = 0;
		
		/**
		* If the current animation choreographies can't be interrupted 
		* 
		* @property {bool} _interruptable
		* @private
		*/
		this._interruptable = true;
		
		/**
		* If frame dropping is allowed for this animation set
		* 
		* @property {bool} _allowFrameDropping
		* @private
		*/
		this._allowFrameDropping = false;
		
		/**
		* The current character
		* 
		* @property {createjs.MovieClip} _character
		* @private
		*/
		this._character = null;
		
		/**
		* Callback function for playing animation 
		* 
		* @property {function} _callback
		* @private
		*/
		this._callback = null;
		
		/** 
		* If this instance has been destroyed
		* 
		* @property {bool} _destroyed
		* @private
		*/
		this._destroyed = false;
	};
	
	var p = CharacterController.prototype;
	
	/**
	*   Set the current character, setting to null clears character
	*   
	*   @function setCharacter
	*   @param {createjs.MovieClip} character MovieClip
	*/
	p.setCharacter = function(character)
	{
		this.clear();
		this._character = character;
		if (this._character)
		{
			Debug.assert(this._character instanceof createjs.MovieClip, "character must subclass MovieClip");
			this._character.stop();
		}
	};
	
	/**
	*   If we want to play a static frame
	*   
	*   @function gotoFrameAndStop
	*   @param {String} event The frame label to stop on
	*/
	p.gotoFrameAndStop = function(event)
	{
		Debug.assert(this._character, "gotoFrameAndStop() requires a character!");
		Animator.stop(this._character);
		this._animationStack.length = 0;
		this._character.gotoAndStop(event);
	};
	
	/**
	 * Will play a sequence of animations
	 * 
	 * @function playClips
	 * @param {Array} clips an array of CharacterClip objects
	 * @param {function} callback Callback for when the animations are either done, or
	 *             have been interrupted. Will pass true is interrupted,
	 *             false if they completed
	 * @param {bool} interruptable If calling this can interrupt the current animation(s)
	 * @param {bool} cancelPreviousCallback Cancel the callback the last time this was called
	 * @param {bool} allowFrameDropping If frame dropping is allowed for this frame, if the Animator is doing frame drop checks
	 */
	p.playClips = function(clips, callback, interruptable, cancelPreviousCallback, allowFrameDropping)
	{
		callback = callback || null;
		interruptable = interruptable || true;
		cancelPreviousCallback = cancelPreviousCallback || true;
		allowFrameDropping = allowFrameDropping || true;
		
		Debug.assert(this._character, "playClips requires a character!");
		
		if (!this._interruptable) return;
		
		Animator.stop(this._character);
		
		this._interruptable = interruptable;
		
		if (this._callback && !cancelPreviousCallback)
		{
			this._callback(true);
		}
		
		this._callback = callback;
		this._animationStack.length = 0;
		for(var c in clips)
		{
			this._animationStack.push(clips[c]);
		}
		this._allowFrameDropping = allowFrameDropping;
		
		this.startNext();
	};
	
	/**
	*   Start the next animation in the sequence
	*   
	*   @function startNext
	*/
	p.startNext = function()
	{
		this._loops = 0;
		if (this._animationStack.length > 0)
		{
			this._currentAnimation = this._animationStack.shift();
			Animator.play(
				this._character, 
				this._currentAnimation.event, 
				this._animationComplete.bind(this), 
				[this], 
				this._allowFrameDropping
			);	
		}
		else if(this._callback)
		{
			this._interruptable = true;
			var cb = this._callback;
			this._callback = null;
			cb(false);
		}
	};
	
	/**
	*   When the animation has completed playing
	*   
	*   @function _animationComplete
	*   @private
	*/
	p._animationComplete = function()
	{		
		this._loops++;
		
		if(this._currentAnimation.loops === 0 || this._loops < this._currentAnimation.loops)
		{
			Animator.play(
				this._character, 
				this._currentAnimation.event, 
				this._animationComplete.bind(this), 
				null, 
				this._allowFrameDropping
			);
		}
		else if (this._currentAnimation.loops == this._loops)
		{
			this.startNext();
		}
	};
	
	/**
	*   Clear any animations for the current character
	*   
	*   @function clear
	*/
	p.clear = function()
	{
		if (this._character)
		{
			Animator.stop(this._character);
		}
		this._currentAnimation = null;
		this._interruptable = true;
		this._callback = null;
		this._animationStack.length = 0;
		this._loops = 0;
	};
	
	/**
	*  Don't use after this
	*  
	*  @function destroy
	*/
	p.destroy = function()
	{
		if(this._destroyed) return;
		
		this._destroyed = true;
		this.clear();
		this._character = null;
		this._animationStack = null;
	};
	
	// Assign to the springroll namespace
	namespace('springroll').CharacterController = CharacterController;
	namespace('springroll.createjs').CharacterController = CharacterController;
}());