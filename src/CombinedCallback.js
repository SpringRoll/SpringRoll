/**
*  @module cloudkid
*/
(function() {
	
	"use strict";

	/**
	*  A function that is used as a normal callback, but checks an object for a property in order to combine two
	*  callbacks into one. For example usage:
	*
	*  var voPlayer = new cloudkid.VOPlayer();
	*  var callback = cloudkid.CombinedCallback.create(myFunc.bind(this), voPlayer, "playing", "_callback");
	*  Animator.play(myClip, "myAnim", callback);
	*  
	*  In this example, when Animator calls 'callback', if voPlayer["playing"] is false, 'myFunc' is called immediately.
	*  If voPlayer["playing"] is true, then voPlayer["_callback"] is set to 'myFunc' so that it will be called when voPlayer completes.
	*  
	*  @class CombinedCallback
	*  @constructor
	*  @param {function} call The callback to call when everything is complete.
	*  @param {*} obj The object to check as an additional completion dependency.
	*  @param {String} prop The property to check on obj. If obj[prop] is false, then it is considered complete.
	*  @param {String} callProp The property to set on obj if obj[prop] is true when the CombinedCallback is called.
	*/
	var CombinedCallback = function(call, obj, prop, callProp)
	{
		if(!obj[prop])//accept anything that resolves to false: eg voPlayer.playing == false
			call();
		else
			obj[callProp] = call;
	};

	/**
	*  Creates a CombinedCallback for use.
	*  
	*  @method create
	*  @static
	*  @param {function} call The callback to call when everything is complete.
	*  @param {*} obj The object to check as an additional completion dependency.
	*  @param {String} prop The property to check on obj. If obj[prop] is false, then it is considered complete.
	*  @param {String} callProp The property to set on obj if obj[prop] is true when the CombinedCallback is called.
	*/
	CombinedCallback.create = function(call, obj, prop, callProp)
	{
		return CombinedCallback.bind(this, call, obj, prop, callProp);
	};

	namespace('cloudkid').CombinedCallback = CombinedCallback;
}());