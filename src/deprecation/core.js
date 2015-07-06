(function(){
	
	var Application = include('springroll.Application');

	/**
	 * @method
	 * @private
	 * @name springroll.Application#getDisplays
	 * @see {@link springroll.Application#displays}
	 * @deprecated since version 0.3.5
	 */
	Application.prototype.getDisplays = function(each)
	{
		console.warn('getDisplays is not deprecated, please use displays property');

		if (typeof each == "function")
		{
			_displays.forEach(each);
		}
		return _displays;
	};

}());