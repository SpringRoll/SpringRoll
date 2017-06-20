/**
 * The data for the drag manager
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
    this.dragOffset = new PIXI.Point();
    this.mouseDownStagePos = {
        x: 0,
        y: 0
    };
};

export default DragData;