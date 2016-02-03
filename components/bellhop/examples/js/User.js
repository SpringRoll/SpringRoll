(function(){
	
	/**
	 * Example for sending a typed object
	 * using Bellhop
	 * @class User
	 * @namespace examples
	 */
	var User = function(name, id)
	{
		this.name = name;
		this.id = id;
	};

	/**
	 * JSON.stringify will convert this into
	 * a special data representation
	 */
	User.prototype.toJSON = function()
	{
		return {
			name : this.name,
			id : this.id,
			// This is important and is requied
			// to reconstruct the class
			// It must contain the full class namespace
			// don't include "window"
			__classname : 'examples.User' 
		};
	};

	/**
	 * Bellhop can use fromJSON to reconstruct
	 * the object based on the serialized version
	 * of the data from the toJSON function.
	 */
	User.prototype.fromJSON = function(data)
	{
		this.name = data.name;
		this.id = data.id;
	};

	// Assign to namespace
	window.examples = {};
	window.examples.User = User;

}());