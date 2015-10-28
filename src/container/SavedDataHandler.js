/**
 * @module Container
 * @namespace springroll
 */
(function()
{
	// Include class
	var SavedData = include('springroll.SavedData');

	/**
	 * Default user data handler for the {{#crossLink "springroll.Container"}}Container{{/crossLink}} to save data using
	 * the {{#crossLink "springroll.SavedData"}}SavedData{{/crossLink}} class.
	 * @class SavedDataHandler
	 */
	var SavedDataHandler = function() {};

	// Reference to prototype
	var p = extend(SavedDataHandler);

	/**
	 * Remove a data setting
	 * @method  remove
	 * @static
	 * @param  {String}   name  The name of the property
	 * @param  {Function} [callback] Callback when remove is complete
	 */
	p.remove = function(name, callback)
	{
		SavedData.remove(name);
		callback();
	};

	/**
	 * Write a custom setting
	 * @method  write
	 * @static
	 * @param  {String}  name  The name of the property
	 * @param {*} value The value to set the property to
	 * @param  {Function} [callback] Callback when write is complete
	 */
	p.write = function(name, value, callback)
	{
		SavedData.write(name, value);
		callback();
	};

	/**
	 * Read a custom setting
	 * @method  read
	 * @static
	 * @param  {String}  name  The name of the property
	 * @param  {Function} callback Callback when read is complete, returns the value
	 */
	p.read = function(name, callback)
	{
		callback(SavedData.read(name));
	};


	// Assign to namespace
	namespace('springroll').SavedDataHandler = SavedDataHandler;

}());