/**
 * @module Hints
 * @namespace springroll
 * @requires Core, Sound, Learning
 */
(function()
{
	//Import classes
	var AbstractHint = include('springroll.AbstractHint');

	/**
	 * Generic function to act as a hint
	 * @class FunctionHint
	 * @extends springroll.AbstractHint
	 * @constructor
	 * @private
	 * @param {springroll.HintsPlayer} hints The instance of the hints
	 * @param {Function} done called on hint done
	 * @param {function} onStart Function to call
	 *                           should accept 2 arguments (callbacks: 
	 *                           onComplete and onCancelled
	 *                           and call them when complete or cancelled
	 */
	var FunctionHint = function(hints, done, onStart)
	{
		AbstractHint.call(this, hints, done);
		this.onStart = onStart;
	};

	//Reference to the prototype
	var s = AbstractHint.prototype;
	var p = extend(FunctionHint, AbstractHint);

	/**
	 * Start function hint
	 * @method play
	 */
	p.play = function()
	{
		this._hints.enabled = false;
		this.onStart(
			this._onPlayComplete.bind(this, null, false),
			this._onPlayComplete.bind(this, null, true)
			);
	};

	/**
	 * Clean-up the hint, don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.onStart = null;
		s.destroy.call(this);
	};

	//Assign to namespace
	namespace('springroll').FunctionHint = FunctionHint;
}());
