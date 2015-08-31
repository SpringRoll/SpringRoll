(function()
{
	var ScaleManager = include('springroll.ScaleManager');
	var p = ScaleManager.prototype;

	/**
	 * @method
	 * @name springroll.ScaleManager#addBackground
	 * @see {@link springroll.ScaleManager#addItem}
	 * @deprecated since version 0.4.0
	 */
	p.addBackground = function(bitmap)
	{
		console.warn("addBackground is now deprecated, please use addItem: e.g.: app.scaling.addItem(bitmap, 'cover-image'); ");
		this.addItem(bitmap, 'cover-image', true);
		return this;
	};

	/**
	 * @method
	 * @name springroll.ScaleManager#removeBackground
	 * @see {@link springroll.ScaleManager#removeItem}
	 * @deprecated since version 0.4.0
	 */
	p.removeBackground = function(bitmap)
	{
		console.warn("removeBackground is now deprecated, please use removeItem: e.g.: app.scaling.removeItem(bitmap); ");
		this.removeItem(bitmap);
		return this;
	};

}());