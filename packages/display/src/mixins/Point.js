/**
 * ### module: @springroll/display
 * @see http://pixijs.download/release/docs/PIXI.Point.html
 * @class PIXI.Point
 */

/**
 * Returns the dot product between this point and another one.
 * @method dotProd
 * @memberof PIXI.Point#
 * @param other {Point} The point to form a dot product with
 * @return The dot product between the two points.
 */
PIXI.Point.prototype.dotProd = function(other) {
    return this.x * other.x + this.y * other.y;
};

/**
 * Returns the length (or magnitude) of this point.
 * @method length
 * @memberof PIXI.Point#
 * @return The length of this point.
 */
PIXI.Point.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 * Returns the squared length (or magnitude) of this point. This is faster than length().
 * @method lengthSq
 * @memberof PIXI.Point#
 * @return The length squared of this point.
 */
PIXI.Point.prototype.lengthSq = function() {
    return this.x * this.x + this.y * this.y;
};

/**
 * Reduces the point to a length of 1.
 * @method normalize
 * @memberof PIXI.Point#
 */
PIXI.Point.prototype.normalize = function() {
    let oneOverLen = 1 / this.length();
    this.x *= oneOverLen;
    this.y *= oneOverLen;
};

/**
 * Subtracts the x and y values of a point from this point.
 * @method substract
 * @memberof PIXI.Point#
 * @param other {Point} The point to subtract from this one
 */
PIXI.Point.prototype.subtract = function(other) {
    this.x -= other.x;
    this.y -= other.y;
};

/**
 * Adds the x and y values of a point to this point.
 * @method add
 * @memberof PIXI.Point#
 * @param other {Point} The point to add to this one
 */
PIXI.Point.prototype.add = function(other) {
    this.x += other.x;
    this.y += other.y;
};

/**
 * Truncate the length of the point to a maximum.
 * @method truncate
 * @memberof PIXI.Point#
 * @param maxLength {number} The maximum length to allow in this point.
 */
PIXI.Point.prototype.truncate = function(maxLength) {
    let l = this.length();
    if (l > maxLength) {
        let maxOverLen = maxLength / l;
        this.x *= maxOverLen;
        this.y *= maxOverLen;
    }
};

/**
 * Multiplies the x and y values of this point by a value.
 * @method scaleBy
 * @memberof PIXI.Point#
 * @param value {number} The value to scale by.
 */
PIXI.Point.prototype.scaleBy = function(value) {
    this.x *= value;
    this.y *= value;
};

/**
 * Calculates the distance between this and another point.
 * @method distance
 * @memberof PIXI.Point#
 * @param other {Point} The point to calculate the distance to.
 * @return {number} The distance.
 */
PIXI.Point.prototype.distance = function(other) {
    let xDiff = this.x - other.x;
    let yDiff = this.y - other.y;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

/**
 * Calculates the squared distance between this and another point.
 * @method distanceSq
 * @memberof PIXI.Point#
 * @param other {Point} The point to calculate the distance to.
 * @return {number} The distance squared.
 */
PIXI.Point.prototype.distanceSq = function(other) {
    let xDiff = this.x - other.x;
    let yDiff = this.y - other.y;
    return xDiff * xDiff + yDiff * yDiff;
};

/**
 * Local to global point.
 * @method localToGlobal
 * @memberof PIXI.Point
 * @param {PIXI.DisplayObject} displayObject - Display object
 * @param {number} localX - Local x position
 * @param {number} localY - Local y position
 * @param {PIXI.Point} [outPoint] output
 * @return {PIXI.Point} Output point
 */
PIXI.Point.localToGlobal = function(displayObject, localX, localY, outPoint) {
    if (!outPoint) {
        outPoint = new PIXI.Point();
    }
    outPoint.x = localX;
    outPoint.y = localY;
    return displayObject.toGlobal(outPoint, outPoint);
};

/**
 * Global to local coordinate space
 * @method globalToLocal
 * @memberof PIXI.Point
 * @param {PIXI.DisplayObject} displayObject - Display object
 * @param {number} globalX - Global x position
 * @param {number} globalY - Global y position
 * @param {PIXI.Point} [outPoint] output
 * @return {PIXI.Point} Output point
 */
PIXI.Point.globalToLocal = function(displayObject, globalX, globalY, outPoint) {
    if (!outPoint) {
        outPoint = new PIXI.Point();
    }
    outPoint.x = globalX;
    outPoint.y = globalY;
    return displayObject.toLocal(outPoint, null, outPoint);
};

/**
 * Global to local coordinate space
 * @method localToLocal
 * @memberof PIXI.Point
 * @param {PIXI.DisplayObject} sourceDisplayObject - Source display object
 * @param {PIXI.DisplayObject} targetDisplayObject - Target display object
 * @param {number} x - Local x position in source object
 * @param {number} y - Local y position in source object
 * @param {PIXI.Point} [outPoint] output
 * @return {PIXI.Point} Output point
 */
PIXI.Point.localToLocal = function(sourceDisplayObject, targetDisplayObject, x, y, outPoint) {
    if (!outPoint) {
        outPoint = new PIXI.Point();
    }
    outPoint.x = x;
    outPoint.y = y;
    return targetDisplayObject.toLocal(outPoint, sourceDisplayObject, outPoint);
};

PIXI.Point.prototype.toString = function() {
    return '(' + this.x + ', ' + this.y + ')';
};
