/**
*  @module CreateJS Display
*  @namespace springroll.createjs
*/
(function(){
	
	/**
	*   CharacterClip is used by the CharacterController class
	*   
	*   @class CharacterClip
	*   @constructor
	*   @param {String} event Animator event to play
	*   @param {int} loops The number of loops
	*/
	var CharacterClip = function(event, loops)
	{
		/**
		* The event to play
		*
		* @property {String} event
		*/
		this.event = event;
		
		/**
		* The number of times to loop
		* 
		* @property {int} loops
		*/
		this.loops = loops || 0;
	};
		
	
	// Assign to the springroll namespace
	namespace('springroll').CharacterClip = CharacterClip;
	namespace('springroll.createjs').CharacterClip = CharacterClip;

}());