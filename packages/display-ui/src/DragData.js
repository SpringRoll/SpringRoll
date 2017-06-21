/**
 * The data for the drag manager
 * @class DragData
 * @private
 * @constructor
 * @param {*} obj The object to drag
 */
export default class DragData
{
    constructor(obj)
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
    }
}