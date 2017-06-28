/**
 * The data for the drag manager
 * @class
 * @private
 */
export default class DragData {
    /**
     * @param {mixed} obj The object to drag
     */
    constructor(obj) {
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