import ScaleManager from './ScaleManager';

/**
 * Initially layouts all interface elements
 * @class Positioner
 * @static
 * @private
 */
export default class Positioner
{
    static get DEG_TO_RAD()
    {
        return Math.PI / 180;
    }

    /**
     * Initial position a single display object
     * @method init
     * @static
     * @param {createjs.DisplayObject|PIXI.DisplayObject} display The display object to scale
     * @param {Object} settings The values for setting
     * @param {Number} [settings.x] The initial X position of the item
     * @param {Number} [settings.y] The initial Y position of the item
     * @param {Object} [settings.scale] The initial scale
     * @param {Number} [settings.scale.x] The initial scale X value
     * @param {Number} [settings.scale.y] The initial scale Y value
     * @param {Object} [settings.pivot] The pivot or registration point.
     * @param {Number} [settings.pivot.x] The pivot point X location
     * @param {Number} [settings.pivot.y] The pivot point Y location
     * @param {Number} [settings.rotation] The initial rotation in degrees
     * @param {Object|Array} [settings.hitArea] An object which describes the hit area
     *                                        of the item or an array of points. See
     *                                        generateHitArea().
     * @param {String} [settings.hitArea.type] If the hitArea is an object, the type
     *                                       of hit area, "rect", "ellipse", "circle", etc
     * @param {DisplayAdapter} [adapter] The adapter for the display being positioned
     *                                 in. If omitted, uses the Application's default display.
     */
    static init(displayObject, settings, adapter)
    {
        //get the default adapter if not specified
        if (!adapter)
        {
            adapter = ScaleManager._getAdapter();
        }

        if (settings.x !== undefined)
        {
            adapter.setPosition(displayObject, settings.x, 'x');
        }

        if (settings.y !== undefined)
        {
            adapter.setPosition(displayObject, settings.y, 'y');
        }

        var pt = settings.scale;
        var scale = adapter.getScale(displayObject);

        if (pt)
        {
            adapter.setScale(displayObject, pt.x * scale.x, 'x');
            adapter.setScale(displayObject, pt.y * scale.y, 'y');
        }
        pt = settings.pivot;

        if (pt)
        {
            adapter.setPivot(displayObject, pt);
        }

        if (settings.rotation !== undefined)
        {
            displayObject.rotation = settings.rotation;
            if (adapter.useRadians)
            {
                displayObject.rotation *= Positioner.DEG_TO_RAD;
            }
        }

        if (settings.hitArea)
        {
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
     * @static
     * @method generateHitArea
     * @param {Object|Array} hitArea One of the following:
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
     * @param {Number} scale The size to scale hitArea by
     * @param {DisplayAdapter} [adapter] The adapter for the display being positioned
     *                                 in. If omitted, uses the Application's default display.
     * @return {Object} A geometric shape object for hit testing, either a Polygon,
     *                Rectangle, Ellipse, Circle, or Sector, depending on the hitArea object.
     *                The shape will have a contains() function for hit testing.
     */
    static generateHitArea(hitArea, scale, adapter)
    {
        //get the default adapter if not specified
        if (!adapter)
        {
            adapter = ScaleManager._getAdapter();
        }

        if (!scale)
        {
            scale = 1;
        }

        if (Array.isArray(hitArea))
        {
            if (scale === 1)
            {
                return new adapter.Polygon(hitArea);
            }
            else
            {
                var temp = [];
                for (var i = 0, len = hitArea.length; i < len; ++i)
                {
                    temp.push(new adapter.Point(
                        hitArea[i].x * scale,
                        hitArea[i].y * scale
                    ));
                }
                return new adapter.Polygon(temp);
            }
        }
        else if (hitArea.type === 'rect' || !hitArea.type)
        {
            return new adapter.Rectangle(
                hitArea.x * scale,
                hitArea.y * scale,
                hitArea.w * scale,
                hitArea.h * scale
            );
        }
        else if (hitArea.type === 'ellipse')
        {
            // Convert center to upper left corner
            return new adapter.Ellipse(
                (hitArea.x - hitArea.w * 0.5) * scale, (hitArea.y - hitArea.h * 0.5) * scale,
                hitArea.w * scale,
                hitArea.h * scale
            );
        }
        else if (hitArea.type === 'circle')
        {
            return new adapter.Circle(
                hitArea.x * scale,
                hitArea.y * scale,
                hitArea.r * scale
            );
        }
        else if (hitArea.type === 'sector')
        {
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
