/**
*  @module CreateJS Display
*  @namespace cloudkid.createjs
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
	namespace('cloudkid').DragData = DragData;
	namespace('cloudkid.createjs').DragData = DragData;
}());