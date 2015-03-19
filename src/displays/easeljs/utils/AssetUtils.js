/**
 * @module EaselJS Utilities
 * @namespace springroll.easeljs
 * @requires Core, EaselJS Display
 */
(function(undefined)
{
	// Optional libraries
	var Animator = include('springroll.easeljs.Animator', false),
		Debug = include('springroll.Debug', false),
		DwellTimer = include('springroll.easeljs.DwellTimer', false);

	/**
	 *  EaselJS-based asset utilities for managing library (FLA-exported) assets.
	 *  @class AssetUtils
	 *  @static
	 */
	var AssetUtils = {};

	/**
	 *  Rip the asset from the library display container and add it
	 *  to the stage, also will try to stop the clip if it can.
	 *  @method add
	 *  @static
	 *  @param {createjs.Container} target The target display object
	 *  @param {createjs.Container} source The source to get assets from
	 *  @param {string} property The property name of the asset
	 *  @param {boolean} [visible] The set the initial visibility state of the object
	 *  @return {createjs.DisplayObject} Return the display object
	 */
	AssetUtils.add = function(target, source, property, visible)
	{
		var asset = source[property];
		if (!asset)
		{
			if (DEBUG && Debug)
			{
				Debug.error("property " + property + " not found in source");
			}
			return;
		}
		//If it's a movieclip stop it
		if (asset.gotoAndStop)
		{
			asset.gotoAndStop(0);
		}
		//Set the initial visible state
		if (visible !== undefined)
		{
			asset.visible = !!visible;
		}

		//Add the child
		target.addChild(asset);

		return asset;
	};

	/**
	 *  Removes a collection of objects from the stage and destroys them if we cant.
	 *  @example AssetUtils.remove(this, this.skipButton, this.character);
	 *  @method remove
	 *  @static
	 *  @param {createjs.Container} target The target display object to remove assets from
	 *  @param {array|*} assets Assets to clean can either be arguments or array
	 */
	AssetUtils.remove = function(target, assets)
	{
		//Start after the target
		var arg, i, j, len = arguments.length;
		for (i = 1; i < len; i++)
		{
			arg = arguments[i];
			if (!arg) continue;

			//test the current argument to see if itself is
			//an array, if it is, run .remove() recursively
			if (Array.isArray(arg) && arg.length > 0)
			{
				for (j = arg.length - 1; j >= 0; --j)
				{
					if (arg[j])
					{
						AssetUtils.remove(target, arg[j]);
					}
				}
				continue;
			}
			
			if (DwellTimer)
				DwellTimer.destroy(arg);

			if (Animator)
				Animator.stop(arg, true);

			if (arg.stop)
			{
				arg.stop();
			}

			if (arg.destroy)
			{
				arg.destroy();
			}

			if (arg.removeAllChildren)
			{
				arg.removeAllChildren(true);
			}

			if (target.contains(arg))
			{
				target.removeChild(arg);
			}
		}
	};

	/**
	 *  Add an asset or array of assets as children to container
	 *  @param {Array|createjs.DisplayObject} assets Asset or Array of assets
	 *  @param {createjs.DisplayObject} container Display object to add children to
	 */
	AssetUtils.addAssetsToContainer = function(assets, container)
	{
		if (!assets)
			return;

		if (!assets.length)
		{
			container.addChild(assets);
		}
		else
		{
			for (var i = assets.length; i >= 0; i--)
			{
				if (assets[i])
				{
					container.addChild(assets[i]);
				}
			}
		}
	};

	/**
	 *  @param container {createjs.Container|*} Container, clip, etc. to add objects to once found
	 *  @param lib {createjs.Lib} Lib that contians the assets
	 *  @param label {String} Label for assets without number suffix
	 *  @param start {Int} Initial number of asset sequence
	 *  @param count {int} How many counts from starting int
	 *  @param visible {Boolean} Initial visiblity of added asset
	 */
	AssetUtils.getAssetSequence = function(container, lib, label, start, count, visible)
	{
		var arr = [];
		arr.push(null); //1-base array
		for (var i = start, mc = null; i <= count; i++)
		{
			mc = AssetUtils.add(container, lib, label + i, visible);
			mc.id = i;
			arr.push(mc);
		}

		return arr;
	};

	//Assign to namespace
	namespace('springroll.easeljs').AssetUtils = AssetUtils;
}());
