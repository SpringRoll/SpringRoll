/**
*  @module Core
*  @namespace springroll
*/
(function()
{
	var ApplicationPlugin = include('springroll.ApplicationPlugin');

	/**
	 * Create an app plugin for Page Visibility listener, all properties and methods documented
	 * in this class are mixed-in to the main Application
	 * @class PageVisibilityPlugin
	 * @extends springroll.ApplicationPlugin
	 */
	var plugin = new ApplicationPlugin();

	// Init the animator
	plugin.setup = function()
	{
		/**
		 * Handles the page visiblity changes automatically
		 * to pause and unpause the application
		 * @property {springroll.PageVisibility} _visibility
		 * @private
		 */
		var PageVisibility = include('springroll.PageVisibility');
		var visibility = this._visibility = new PageVisibility(
			onVisible.bind(this),
			onHidden.bind(this)
		);

		/**
		 * The application pauses automatically when the window loses focus.
		 * @property {Boolean} options.autoPause
		 * @default true
		 */
		this.options.add('autoPause', true)
			.on('autoPause', function(value)
			{
				visibility.enabled = value;
			})
			.respond('autoPause', function()
			{
				return visibility.enabled;
			});
	};

	/**
	 *  Private listener for when the page is hidden.
	 *  @method onHidden
	 *  @private
	 */
	var onHidden = function()
	{
		this.paused = true;
	};

	/**
	 *  Private listener for when the page is shown.
	 *  @method onVisible
	 *  @private
	 */
	var onVisible = function()
	{
		this.paused = false;
	};

	// Destroy the animator
	plugin.teardown = function()
	{
		if (this._visibility) this._visibility.destroy();
		this._visibility = null;
	};

}());