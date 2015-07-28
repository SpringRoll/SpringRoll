/**
 * @module Pixi Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function(undefined)
{
	var AtlasReader = include('PIXI.spine.SpineRuntime.AtlasReader', false),
		AtlasPage = include('PIXI.spine.SpineRuntime.AtlasPage', false),
		AtlasRegion = include('PIXI.spine.SpineRuntime.AtlasRegion', false),
		Atlas = include('PIXI.spine.SpineRuntime.Atlas', false);
	
	if(!AtlasReader) return;
	
	/**
	 * Handles an atlas exported from Spine. This class is created during Spine loading, and
	 * should probably never be used on its own. Code in this class is pulled from
	 * https://github.com/pixijs/pixi-spine/blob/master/src/SpineRuntime/Atlas.js
	 *
	 * @class SpineAtlas
	 * @constructor
	 * @param {String} atlasText The Spine Atlas data
	 * @param {Object} textureDictionary All of the images required by the atlas.
	 */
	var SpineAtlas = function(atlasText, textureDictionary)
	{
		this.pages = [];
		this.regions = [];
		
		var reader = new AtlasReader(atlasText);
		var tuple = [];
		tuple.length = 4;
		var page = null;
		while (true)
		{
			var line = reader.readLine();
			if (line === null) break;
			line = reader.trim(line);
			if (!line.length)
			{
				page = null;
			}
			else if (!page)
			{
				page = new AtlasPage();
				page.name = line;
		
				if (reader.readTuple(tuple) == 2)
				{
					// size is only optional for an atlas packed with an old TexturePacker.
					page.width = parseInt(tuple[0]);
					page.height = parseInt(tuple[1]);
					reader.readTuple(tuple);
				}
				page.format = Atlas.Format[tuple[0]];
		
				reader.readTuple(tuple);
				page.minFilter = Atlas.TextureFilter[tuple[0]];
				page.magFilter = Atlas.TextureFilter[tuple[1]];
		
				var direction = reader.readValue();
				page.uWrap = Atlas.TextureWrap.clampToEdge;
				page.vWrap = Atlas.TextureWrap.clampToEdge;
				if (direction == "x")
					page.uWrap = Atlas.TextureWrap.repeat;
				else if (direction == "y")
					page.vWrap = Atlas.TextureWrap.repeat;
				else if (direction == "xy")
					page.uWrap = page.vWrap = Atlas.TextureWrap.repeat;
		
				page.rendererObject = textureDictionary[line].baseTexture;
		
				this.pages.push(page);
		
			}
			else
			{
				var region = new AtlasRegion();
				region.name = line;
				region.page = page;
		
				region.rotate = reader.readValue() == "true";
		
				reader.readTuple(tuple);
				var x = parseInt(tuple[0]);
				var y = parseInt(tuple[1]);
		
				reader.readTuple(tuple);
				var width = parseInt(tuple[0]);
				var height = parseInt(tuple[1]);
		
				region.u = x / page.width;
				region.v = y / page.height;
				if (region.rotate)
				{
					region.u2 = (x + height) / page.width;
					region.v2 = (y + width) / page.height;
				}
				else
				{
					region.u2 = (x + width) / page.width;
					region.v2 = (y + height) / page.height;
				}
				region.x = x;
				region.y = y;
				region.width = Math.abs(width);
				region.height = Math.abs(height);
		
				if (reader.readTuple(tuple) == 4)
				{
					// split is optional
					region.splits = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];
		
					if (reader.readTuple(tuple) == 4)
					{
						// pad is optional, but only present with splits
						region.pads = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];
						
						reader.readTuple(tuple);
					}
				}
		
				region.originalWidth = parseInt(tuple[0]);
				region.originalHeight = parseInt(tuple[1]);
		
				reader.readTuple(tuple);
				region.offsetX = parseInt(tuple[0]);
				region.offsetY = parseInt(tuple[1]);
		
				region.index = parseInt(reader.readValue());
		
				this.regions.push(region);
			}
		}
	};
	
	// Extend Object
	var p = SpineAtlas.prototype = {};
	
	p.findRegion = function(name)
	{
		var regions = this.regions;
		for (var i = 0, n = regions.length; i < n; i++)
			if (regions[i].name == name) return regions[i];
		return null;
	};
	
	p.dispose = function()
	{
		var pages = this.pages;
		for (var i = 0, n = pages.length; i < n; i++)
			pages[i].rendererObject.destroy(true);
	};
	
	p.updateUVs = function(page)
	{
		var regions = this.regions;
		for (var i = 0, n = regions.length; i < n; i++)
		{
			var region = regions[i];
			if (region.page != page) continue;
			region.u = region.x / page.width;
			region.v = region.y / page.height;
			if (region.rotate)
			{
				region.u2 = (region.x + region.height) / page.width;
				region.v2 = (region.y + region.width) / page.height;
			}
			else
			{
				region.u2 = (region.x + region.width) / page.width;
				region.v2 = (region.y + region.height) / page.height;
			}
		}
	};

	/**
	 * Destroys the SpineAtlas by nulling the image and frame dictionary references.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.dispose();
		this.pages = this.regions = null;
	};

	namespace("springroll.pixi").SpineAtlas = SpineAtlas;
}());