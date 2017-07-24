/**
 * Initially layouts all interface elements
 * @class
 * @memberof springroll
 * @private
 */
export default class Positioner {

    /**
     * Initial position a single display object
     * @param {PIXI.DisplayObject} display The display object to scale
     * @param {object} settings The values for setting
     * @param {number} [settings.x] The initial X position of the item
     * @param {number} [settings.y] The initial Y position of the item
     * @param {object} [settings.scale] The initial scale
     * @param {number} [settings.scale.x] The initial scale X value
     * @param {number} [settings.scale.y] The initial scale Y value
     * @param {object} [settings.pivot] The pivot or registration point.
     * @param {number} [settings.pivot.x] The pivot point X location
     * @param {number} [settings.pivot.y] The pivot point Y location
     * @param {number} [settings.rotation] The initial rotation in degrees
     * @param {object|Array} [settings.hitArea] An object which describes the hit area
     *                                        of the item or an array of points. See
     *                                        generateHitArea().
     * @param {string} [settings.hitArea.type] If the hitArea is an object, the type
     *                                       of hit area, "rect", "ellipse", "circle", etc
     */
    static init(displayObject, settings) {

        if (settings.x !== undefined) {
            displayObject.x = settings.x;
        }

        if (settings.y !== undefined) {
            displayObject.y = settings.y;
        }

        let pt = settings.scale;

        if (pt) {
            displayObject.scale.y *= pt.x;
            displayObject.scale.y *= pt.y;
        }
        pt = settings.pivot;

        if (pt) {
            displayObject.pivot.set(pt.x, pt.y);
        }

        if (settings.rotation !== undefined) {
            displayObject.rotation = settings.rotation * PIXI.DEG_TO_RAD;
        }

        if (settings.hitArea) {
            displayObject.hitArea = Positioner.generateHitArea(settings.hitArea);
        }
    }

    /**
     * Create the polygon hit area for interface elements
     * @param {object|Array} hitArea One of the following:
     *
     *   // An array of points for a polygon.
     *   [{x:0, y:0}, {x:0, y:20}, {x:20, y:0}]
     *
     *   // An object describing a rectangle.
     *   {type:"rect", x:0, y:0, w:10, h:30}
     *
     *   // An object describing an ellipse, where x and y are the center.
     *   {type:"ellipse", x:0, y:0, w:10, h:30}
     *
     *   // An object describing a circle, where x and y are the center.
     *   {type:"circle", x:0, y:0, r:20}
     *
     *   // An object describing a sector, where x and y are the center of a circle
     *   // and start/end are the start and end angles of the sector in degrees.
     *   {type:"sector", x:0, y:0, r:20, start:0, end:90}
     *
     * @param {number} [scale=1] The size to scale hitArea by
     * @return {object} A geometric shape object for hit testing, either a Polygon,
     *                Rectangle, Ellipse, Circle, or Sector, depending on the hitArea object.
     *                The shape will have a contains() function for hit testing.
     */
    static generateHitArea(hitArea, scale = 1) {

        if (Array.isArray(hitArea)) {
            if (scale === 1) {
                return new PIXI.Polygon(hitArea);
            }
            else {
                let temp = [];
                for (let i = 0, len = hitArea.length; i < len; ++i) {
                    temp.push(new PIXI.Point(
                        hitArea[i].x * scale,
                        hitArea[i].y * scale
                    ));
                }
                return new PIXI.Polygon(temp);
            }
        }
        else if (hitArea.type === 'rect' || !hitArea.type) {
            return new PIXI.Rectangle(
                hitArea.x * scale,
                hitArea.y * scale,
                hitArea.w * scale,
                hitArea.h * scale
            );
        }
        else if (hitArea.type === 'ellipse') {
            // Convert center to upper left corner
            return new PIXI.Ellipse(
                (hitArea.x - hitArea.w * 0.5) * scale, (hitArea.y - hitArea.h * 0.5) * scale,
                hitArea.w * scale,
                hitArea.h * scale
            );
        }
        else if (hitArea.type === 'circle') {
            return new PIXI.Circle(
                hitArea.x * scale,
                hitArea.y * scale,
                hitArea.r * scale
            );
        }
        else if (hitArea.type === 'sector') {
            return new PIXI.Sector(
                hitArea.x * scale,
                hitArea.y * scale,
                hitArea.r * scale,
                hitArea.start,
                hitArea.end
            );
        }
        return null;
    }
}
