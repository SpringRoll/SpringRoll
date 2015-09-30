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