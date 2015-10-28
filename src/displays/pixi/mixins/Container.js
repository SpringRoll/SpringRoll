/**
 * @module PIXI Display
 * @namespace PIXI
 * @requires Core
 */
(function(undefined)
{
	/**
	 *  Mixins for the PIXI Container class
	 *  @class Container
	 */

	var Container = include("PIXI.Container", false);
	if (!Container) return;

	var p = Container.prototype;

	/**
	 * Determines if width and height will calculate bounds of all children using getLocalBounds(),
	 * or only use the internal _width or _height. This should really only be set once, when the
	 * display object is initialized. Note that without this property, the default would be to
	 * use getLocalBounds();
	 * @property useBoundsForSize
	 * @type {Boolean}
	 * @default true
	 */
	p.useBoundsForSize = true;

	p._width = 0;
	p._height = 0;

	if (Object.getOwnPropertyDescriptor(p, 'width').configurable)
	{
		Object.defineProperty(p, 'width',
		{
			configurable: true,
			get: function()
			{
				if (this.useBoundsForSize)
					return this.scale.x * this.getLocalBounds().width;
				else
					return this.scale.x * this._width;
			},
			set: function(value)
			{
				if (this.useBoundsForSize)
				{
					var width = this.getLocalBounds().width;
					if (width !== 0)
						this.scale.x = value / width;
					else
						this.scale.x = 1;
					this._width = value;
				}
				else
				{
					if (this._width === 0)
						this._width = value / this.scale.x;
					else
						this.scale.x = value / this._width;
				}
			}
		});

		Object.defineProperty(p, 'height',
		{
			configurable: true,
			get: function()
			{
				if (this.useBoundsForSize)
					return this.scale.y * this.getLocalBounds().height;
				else
					return this.scale.y * this._height;
			},
			set: function(value)
			{
				if (this.useBoundsForSize)
				{
					var height = this.getLocalBounds().height;
					if (height !== 0)
						this.scale.y = value / height;
					else
						this.scale.y = 1;
					this._height = value;
				}
				else
				{
					if (this._height === 0)
						this._height = value / this.scale.y;
					else
						this.scale.y = value / this._height;
				}
			}
		});
	}

}());