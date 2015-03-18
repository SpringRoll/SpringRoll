/**
 * @module EaselJS Interface
 * @namespace springroll.easeljs
 * @requires EaselJS Display
 */
(function() {
	
	var DragData = function(obj)
	{
		this.obj = obj;
		this.mouseDownObjPos = {x:0, y:0};
		this.dragOffset = new createjs.Point();
		this.mouseDownStagePos = {x:0, y:0};
	};
	
	/** Assign to the global namespace */
	namespace('springroll').DragData = DragData;
	namespace('springroll.easeljs').DragData = DragData;
}());