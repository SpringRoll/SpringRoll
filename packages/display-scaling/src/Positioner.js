import ScaleManager from './ScaleManager';

/**
 * Initially layouts all interface elements
 * @class
 * @memberof springroll
 * @private
 */
export default class Positioner {
    /**
     * Degrees to radians constant
     * @member {number}
     */
    static get DEG_TO_RAD() {
        return Math.PI / 180;
    }

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
     * @param {DisplayAdapter} [adapter] The adapter for the display being positioned
     *                                 in. If omitted, uses the Application's default display.
     */
    static init(displayObject, settings, adapter) {
        //get the default adapter if not specified
        if (!adapter) {
            adapter = ScaleManager._getAdapter();
        }

        if (settings.x !== undefined) {
            adapter.setPosition(displayObject, settings.x, 'x');
        }

        if (settings.y !== undefined) {
            adapter.setPosition(displayObject, settings.y, 'y');
        }

        let pt = settings.scale;
        let scale = adapter.getScale(displayObject);

        if (pt) {
            adapter.setScale(displayObject, pt.x * scale.x, 'x');
            adapter.setScale(displayObject, pt.y * scale.y, 'y');
        }
        pt = settings.pivot;

        if (pt) {
            adapter.setPivot(displayObject, pt);
        }

        if (settings.rotation !== undefined) {
            displayObject.rotation = settings.rotation;
            if (adapter.useRadians) {
                displayObject.rotation *= Positioner.DEG_TO_RAD;
            }
        }

        if (settings.hitArea) {
            adapter.setHitArea(
                displayObject,
                Positioner.generateHitArea(
                    settings.hitArea, 1, adapter
                )
            );
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
     * @param {number} scale The size to scale hitArea by
     * @param {DisplayAdapter} [adapter] The adapter for the display being positioned
     *                                 in. If omitted, uses the Application's default display.
     * @return {object} A geometric shape object for hit testing, either a Polygon,
     *                Rectangle, Ellipse, Circle, or Sector, depending on the hitArea object.
     *                The shape will have a contains() function for hit testing.
     */
    static generateHitArea(hitArea, scale, adapter) {
        //get the default adapter if not specified
        if (!adapter) {
            adapter = ScaleManager._getAdapter();
        }

        if (!scale) {
            scale = 1;
        }

        if (Array.isArray(hitArea)) {
            if (scale === 1) {
                return new adapter.Polygon(hitArea);
            }
            else {
                let temp = [];
                for (let i = 0, len = hitArea.length; i < len; ++i) {
                    temp.push(new adapter.Point(
                        hitArea[i].x * scale,
                        hitArea[i].y * scale
                    ));
                }
                return new adapter.Polygon(temp);
            }
        }
        else if (hitArea.type === 'rect' || !hitArea.type) {
            return new adapter.Rectangle(
                hitArea.x * scale,
                hitArea.y * scale,
                hitArea.w * scale,
                hitArea.h * scale
            );
        }
        else if (hitArea.type === 'ellipse') {
            // Convert center to upper left corner
            return new adapter.Ellipse(
                (hitArea.x - hitArea.w * 0.5) * scale, (hitArea.y - hitArea.h * 0.5) * scale,
                hitArea.w * scale,
                hitArea.h * scale
            );
        }
        else if (hitArea.type === 'circle') {
            return new adapter.Circle(
                hitArea.x * scale,
                hitArea.y * scale,
                hitArea.r * scale
            );
        }
        else if (hitArea.type === 'sector') {
            return new adapter.Sector(
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
