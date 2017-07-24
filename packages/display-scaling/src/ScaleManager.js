import ScaleItem from './ScaleItem';
import ScaleImage from './ScaleImage';
import Positioner from './Positioner';
import {Application} from '@springroll/core';

// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

/**
 * The UI scale is responsible for scaling UI components to help easy the burden of different
 * device aspect ratios. The UI can expand either vertically or horizontally to fill excess
 * space.
 * ### module: @springroll/display-scaling
 *
 * @class
 * @memberof springroll
 */
export default class ScaleManager {

    constructor() {

        /**
         * The configuration for each items
         * @member {Array}
         * @private
         */
        this._items = [];

        /**
         * The screen settings object, contains information about designed size
         * @member {object}
         * @private
         */
        this._size = null;

        /**
         * The current overall scale of the game
         * @member {number}
         * @private
         * @default 1
         */
        this._scale = 1;

        /**
         * The internal enabled
         * @member {boolean}
         * @private
         */
        this._enabled = false;

        // @if DEBUG
        /**
         * If we should log verbose messages (unminified module only!)
         * @member {boolean}
         * @default false
         */
        this.verbose = false;
        // @endif

        // Setup the resize bind
        this._resize = this._resize.bind(this);

        // Set the enabled status
        this.enabled = this._enabled;
    }

    /**
     * The design sized of the application
     * @member {object} size
     * @property {Num}
     * @member {number} size.width - The designed width of the application
     * @member {number} size.height - The designed width of the application
     * @member {number} size.maxWidth - The designed max width of the application
     * @member {number} size.maxHeight - The designed maxHeight of the application
     * @default null
     */
    set size(size) {
        this._size = size;

        if (!size) {
            return;
        }

        if (!size.width || !size.height) {
            // @if DEBUG
            Debug.error(size);
            throw 'Designed size parameter must be a plain object with \'width\' & \'height\' properties';
            // @endif
            // @if RELEASE
            // eslint-disable-next-line no-unreachable
            throw 'Invalid design settings';
            // @endif
        }

        // Allow for responsive designs if they're a max width
        let options = Application.instance.options;
        if (size.maxWidth) {
            // Set the max width so that Application can limit the aspect ratio properly
            options.maxWidth = size.maxWidth;
        }
        if (size.maxHeight) {
            // Set the max height so that Application can limit the aspect ratio properly
            options.maxHeight = size.maxHeight;
        }
    }
    get size() {
        return this._size;
    }

    /**
     * Get the current scale of the screen relative to the designed screen size
     * @member {number}
     * @readOnly
     */
    get scale() {
        return this._scale;
    }

    /**
     * The total number of items
     * @member {number}
     * @readOnly
     */
    get numItems() {
        return this._items.length;
    }

    /**
     * Whether the ScaleManager should listen to the stage resize. Setting to true
     * initialized a resize.
     * @member {boolean}
     * @default true
     */
    get enabled() {
        return this._enabled;
    }
    set enabled(enabled) {
        this._enabled = enabled;
        let app = Application.instance;

        app.off('resize', this._resize);
        if (enabled) {
            app.on('resize', this._resize);

            // Refresh the resize event
            app.triggerResize();
        }
    }

    /**
     * Remove all items where the item display is a the container or it contains items
     * @param  {any} parent The object which contains the items as live variables.
     * @param {object} items The items that was passed to `addItems`
     * @return {springroll.ScaleManager} The ScaleManager for chaining
     */
    removeItems(parent, items) {
        let children = [];
        if (items) {
            // Get the list of children to remove
            for (let name in items) {
                if (parent[name]) {
                    children.push(parent[name]);
                }
            }
        }
        else {
            // @deprecated implementation
            // @if DEBUG
            // eslint-disable-next-line no-console
            console.warn('ScaleManager.removeItems should have a second parameter which is the items dictionary e.g., removeItems(panel, items)');
            // @endif
            return this.removeItemsByContainer(parent);
        }

        // Remove the items by children's list
        if (children.length) {
            let _itemsCopy = this._items.slice();
            let _items = this._items;
            _itemsCopy.forEach(function(item) {
                if (children.indexOf(item.display) > -1) {
                    _items.splice(_items.indexOf(item), 1);
                }
            });
        }
        return this;
    }

    /**
     * Remove all items where the item display is a child of the container display
     * @param  {PIXI.Container} container The container to remove items from
     * @return {springroll.ScaleManager} The ScaleManager for chaining
     */
    removeItemsByContainer(container) {
        this._items.forEach((item, i, items) => {
            if (this.contains(container, item.display)) {
                items.splice(i, 1);
            }
        });
        return this;
    }

    /**
     * Check if a container contains child.
     * @param  {PIXI.Container} container The container to remove items from
     * @return {boolean} `true` if container contains child, `false` if not
     */
    contains(container, child) {
        while (child) {
            if (child === container) {
                return true;
            }
            child = child.parent;
        }
        return false;
    }

    /**
     * Remove a single item from the scaler
     * @param  {PIXI.Sprite|PIXI.Container} display The object to remove
     * @return {springroll.ScaleManager} The ScaleManager for chaining
     */
    removeItem(display) {
        let items = this._items;
        for (let i = 0, len = items.length; i < len; i++) {
            if (items[i].display === display) {
                items.splice(i, 1);
                break;
            }
        }
        return this;
    }

    /**
     * Register a dictionary of items to the ScaleManager to control.
     * @param {any} parent The parent object that contains the items as variables.
     * @param {object} items The items object where the keys are the name of the property on the
     *                     parent and the value is an object with keys of "titleSafe", "minScale",
     *                     "maxScale", "centerHorizontally", "align", see ScaleManager.addItem for a
     *                     description of the different keys.
     * @return {springroll.ScaleManager} The instance of this ScaleManager for chaining
     */
    addItems(parent, items) {
        // Temp variables
        let settings;
        let name;

        // Loop through all the items and register
        // Each dpending on the settings
        for (name in items) {
            settings = items[name];

            if (!parent[name]) {
                // @if DEBUG
                if (this.verbose) {
                    Debug.info('ScaleManager: could not find object \'' + name + '\'');
                }
                // @endif
                continue;
            }
            this.addItem(parent[name], settings, false);
        }
        Application.instance.triggerResize();
        return this;
    }

    /**
     * Manually add an item
     * @param {PIXI.DisplayObject} displayObject The display object item
     * @param {object|string} [settings="center"] The collection of settings or the align property
     * @param {string} [settings.align="center"] The vertical alignment ("top", "bottom", "center")
     *      then horizontal alignment ("left", "right" and "center"). Or you can use the short-
     *      handed versions: "center" = "center-center", "top" = "top-center", 
     *      "bottom" = "bottom-center", "left" = "center-left", "right" = "center-right".
     * @param {Boolean|string} [settings.titleSafe=false] If the item needs to be in the title safe
     *      area. Acceptable values are false, "horizontal", "vertical", "all", and true.
     *      The default is false, and true is the same as "all".
     * @param {number} [settings.minScale=NaN] The minimum scale amount (default, scales the same
     *      size as the stage)
     * @param {number} [settings.maxScale=NaN] The maximum scale amount (default, scales the same
     *      size as the stage)
     * @param {boolean} [settings.centeredHorizontally=false] Makes sure that the center of the
     *      object is directly in the center of the stage assuming origin point is in
     *      the upper-left corner.
     * @param {number} [settings.x] The initial X position of the item
     * @param {number} [settings.y] The initial Y position of the item
     * @param {object} [settings.scale] The initial scale
     * @param {number} [settings.scale.x] The initial scale X value
     * @param {number} [settings.scale.y] The initial scale Y value
     * @param {object} [settings.pivot] The pivot point
     * @param {number} [settings.pivot.x] The pivot point X location
     * @param {number} [settings.pivot.y] The pivot point Y location
     * @param {number} [settings.rotation] The initial rotation in degrees
     * @param {object|Array} [settings.hitArea] An object which describes the hit area of the item
     *      or an array of points.
     * @param {string} [settings.hitArea.type] If the hitArea is an object, the type of hit area,
     *      "rect", "ellipse", "circle", etc
     * @return {springroll.ScaleManager} The instance of this ScaleManager for chaining
     */
    /**
     * Add a bitmap to make be fullscreen
     * @method  addItem
     * @param {PIXI.Sprite} bitmap The bitmap to scale
     * @param {string} settings      Must be 'cover-image'
     * @return {springroll.ScaleManager} The instance of this ScaleManager for chaining
     */
    addItem(displayObject, settings, doResize) {
        if (doResize === undefined) {
            doResize = true;
        }
        if (!settings) {
            settings = {
                align: ScaleManager.ALIGN_CENTER
            };
        }

        if (settings === 'cover-image') {
            this._items.push(new ScaleImage(displayObject, this._size));
        }
        else {
            if (typeof settings === 'string') {
                settings = {
                    align: settings
                };
            }
            let align = settings.align || ScaleManager.ALIGN_CENTER;

            // Interpret short handed versions
            switch (align) {
                case ScaleManager.ALIGN_CENTER:
                    align = align + '-' + align;
                    break;
                case ScaleManager.ALIGN_LEFT:
                case ScaleManager.ALIGN_RIGHT:
                    align = ScaleManager.ALIGN_CENTER + '-' + align;
                    break;
                case ScaleManager.ALIGN_TOP:
                case ScaleManager.ALIGN_BOTTOM:
                    align = align + '-' + ScaleManager.ALIGN_CENTER;
                    break;
            }

            // Error check the alignment value input
            if (!/^(center|top|bottom)-(left|right|center)$/.test(align)) {
                throw 'Item align \'' + align + '\' is invalid for ' + displayObject;
            }

            // Do the intial positioning of the display object
            Positioner.init(displayObject, settings);

            // Create the item settings
            let item = new ScaleItem(displayObject, align, this._size);

            item.titleSafe = settings.titleSafe === 'all' ? true : settings.titleSafe;
            item.maxScale = settings.maxScale || NaN;
            item.minScale = settings.minScale || NaN;
            item.centeredHorizontally = !!settings.centeredHorizontally;

            this._items.push(item);
        }
        if (doResize) {
            Application.instance.triggerResize();
        }
        return this;
    }

    /**
     * Scale the UI items that have been registered to the current screen
     * @private
     * @param {number} w The current width of the application
     * @param {number} h The current height of the application
     */
    _resize(w, h) {
        let _size = this._size;

        // Size hasn't been setup yet
        if (!_size) {
            // @if DEBUG
            Debug.warn('Unable to resize scaling because the scaling size hasn\'t been set.');
            // @endif
            return;
        }

        let defaultRatio = _size.width / _size.height;
        let currentRatio = w / h;
        this._scale = currentRatio > defaultRatio ?
            h / _size.height :
            w / _size.width;

        // Resize all the items
        this._items.forEach(function(item) {
            item.resize(w, h);
        });
    }

    /**
     * Destroy the scaler object
     */
    destroy() {
        this.enabled = false;

        this._items.forEach(function(item) {
            item.destroy();
        });

        this._size = null;
        this._items = null;
    }
}

/**
 * Vertically align to the top
 * @member {string}
 * @static
 * @final
 * @readOnly
 * @default "top"
 */
ScaleManager.ALIGN_TOP = 'top';

/**
 * Vertically align to the bottom
 * @member {string}
 * @static
 * @final
 * @readOnly
 * @default "bottom"
 */
ScaleManager.ALIGN_BOTTOM = 'bottom';

/**
 * Horizontally align to the left
 * @member {string}
 * @static
 * @final
 * @readOnly
 * @default "left"
 */
ScaleManager.ALIGN_LEFT = 'left';

/**
 * Horizontally align to the right
 * @member {string}
 * @static
 * @final
 * @readOnly
 * @default "right"
 */
ScaleManager.ALIGN_RIGHT = 'right';

/**
 * Vertically or horizontally align to the center
 * @member {string}
 * @static
 * @final
 * @readOnly
 * @default "center"
 */
ScaleManager.ALIGN_CENTER = 'center';
