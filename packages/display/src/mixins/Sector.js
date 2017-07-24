/**
 * The Sector object can be used to specify a hit area for display objects.
 * It represents a sector of a circle, with angles expressed in degrees going
 * counterclockwise.
 * ### module: @springroll/display
 *
 * @class
 * @param x {number} The X coord of the center of the circle this sector is on
 * @param y {number} The Y coord of the center of the circle this sector is on
 * @param radius {number} The radius of the circle
 * @param startAngle {number} The starting angle of the sector, in degrees
 * @param endAngle {number} The ending angle of the sector, in degrees
 */
PIXI.Sector = function(x, y, radius, startAngle, endAngle) {
    /**
     * @property x
     * @type Number
     * @default 0
     */
    this.x = x || 0;

    /**
     * @property y
     * @type Number
     * @default 0
     */
    this.y = y || 0;

    /**
     * @property radius
     * @type Number
     * @default 0
     */
    this.radius = radius || 0;

    /**
     * @property startAngle
     * @type Number
     * @default 0
     */
    this.startAngle = startAngle || 0;

    //for math purposes, ensure that this is greater than 0
    while (this.startAngle < 0) {
        this.startAngle += 360;
    }

    /**
     * @property endAngle
     * @type Number
     * @default 0
     */
    this.endAngle = endAngle || 0;

    //for math purposes, ensure that this is greater than startAngle
    if (this.endAngle < this.startAngle) {
        this.endAngle += 360;
    }
};

/**
 * Creates a clone of this Sector instance
 *
 * @return {Sector} a copy of the polygon
 */
PIXI.Sector.prototype.clone = function() {
    return new PIXI.Sector(this.x, this.y, this.radius, this.startAngle, this.endAngle);
};

/**
 * Checks if the x, and y coords passed to this function are contained within this circle
 *
 * @param x {number} The X coord of the point to test
 * @param y {number} The Y coord of the point to test
 * @return {boolean} if the x/y coords are within this polygon
 */
PIXI.Sector.prototype.contains = function(x, y) {
    if (this.radius <= 0) {
        return false;
    }

    let dx = (this.x - x),
        dy = (this.y - y),
        r2 = this.radius * this.radius;

    dx *= dx;
    dy *= dy;

    if (dx + dy > r2) {
        return false;
    }

    let angle = Math.atan2(y - this.y, x - this.x) * PIXI.RAD_TO_DEG;
    //make the angle in the same space as the sector
    while (angle < this.startAngle) {
        angle += 360;
    }
    return angle >= this.startAngle && angle <= this.endAngle;
};
