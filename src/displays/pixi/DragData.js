/**
*  @module PIXI Display
*  @namespace cloudkid.pixi
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
	namespace('cloudkid.pixi').DragData = DragData;
}());