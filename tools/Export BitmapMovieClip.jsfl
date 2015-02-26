(function(global){
	
	/**
	*  The JSON serialization and unserialization methods
	*  @class JSON
	*/
	var JSON = {};

	JSON.prettyPrint = false;

	/**
	*  implement JSON.stringify serialization
	*  @method stringify
	*  @param {Object} obj The object to convert
	*/
	JSON.stringify = function(obj)
	{
		return _internalStringify(obj, 0);
	};

	function _internalStringify(obj, depth, fromArray)
	{
		var t = typeof (obj);
		if (t != "object" || obj === null)
		{
			// simple data type
			if (t == "string") return '"'+obj+'"';
			return String(obj);
		}
		else
		{
			// recurse array or object
			var n, v, json = [], arr = (obj && obj.constructor == Array);

			var joinString, bracketString, firstPropString;
			if(JSON.prettyPrint)
			{
				joinString = ",\n";
				bracketString = "\n";
				for(var i = 0; i < depth; ++i)
				{
					joinString += "\t";
					bracketString += "\t";
				}
				joinString += "\t";//one extra for the properties of this object
				firstPropString = bracketString + "\t";
			}
			else
			{
				joinString = ",";
				firstPropString = bracketString = "";
			}
			for (n in obj)
			{
				v = obj[n]; t = typeof(v);

				// Ignore functions
				if (t == "function") continue;

				if (t == "string") v = '"'+v+'"';
				else if (t == "object" && v !== null) v = _internalStringify(v, depth + 1, arr);

				json.push((arr ? "" : '"' + n + '":') + String(v));
			}
			return (fromArray || depth == 0 ? "" : bracketString)+ (arr ? "[" : "{") + firstPropString + json.join(joinString) + bracketString + (arr ? "]" : "}");
		}
	}

	/**
	*  Implement JSON.parse de-serialization
	*  @method parse
	*  @param {String} str The string to de-serialize
	*/
	JSON.parse = function(str)
	{
		if (str === "") str = '""';
		eval("var p=" + str + ";");
		return p;
	};

	// Assign to global space
	global.JSON = JSON;

}(window));

//=========== Actual export code
(function(){
	/**
	 * Export a MovieClip or Graphic as a spritesheet
	 * with some extra JSON data that describes the timeline
	 * @class BitmapMovieClip
	 */
	var BitmapMovieClip = function()
	{
		// Check for document
		this.dom = fl.getDocumentDOM();
		if (!this.dom) return;

		JSON.prettyPrint = true;

		var library = this.dom.library;
		var selectedItems = library.getSelectedItems().slice();
		if(selectedItems.length === 0)
		{
			alert("You must have one or more movieclips selected in the library to export.");
			return;
		}
		for(var i = 0; i < selectedItems.length; ++i)
		{
			var item = selectedItems[i];
			if(item.itemType == "movie clip" || item.itemType == "graphic")
			{
				this.exportClip(item);
			}
		}
	};

	// Reference tot he prototype
	var p = BitmapMovieClip.prototype;

	/**
	 * Export a single clip
	 * @param  {SymbolInstance} selectedItem The symbol movieclip or graphic to export
	 */
	p.exportClip = function(selectedItem)
	{
		var symbolPath = selectedItem.name.substring(0, selectedItem.name.indexOf("/") + 1),
			symbolName = selectedItem.name.substring(selectedItem.name.indexOf("/") + 1),
			scaledItem,
			library;

		var scale = prompt("What scale is " + symbolName +
			" being exported at?\n(press cancel to skip this movieclip)", "1");

		if (!scale)
		{
			return;
		}
		else if(parseFloat(scale) > 0)
		{
			scale = parseFloat(scale);
		}
		else
		{
			scale = 1;
		}

		var outputObj = {};

		//keep track of this for proper reassembly
		outputObj.scale = scale;
		outputObj.fps = this.dom.frameRate;
		outputObj.labels = {};

		//get all those pesky frame labels
		var timeline = selectedItem.timeline;
		var layers = timeline.layers, frames;
		
		var totalLength = 0;
		for (var l = 0, lLen = layers.length; l < lLen; ++l)
		{
			var layer = layers[l];
			if(layer.layerType == "folder") continue;

			// hide guide/mask layers and show everything else,
			// for origin calculation purposes
			layer.visible = layer.layerType != "guide" && layer.layerType != "mask";

			frames = layer.frames;
			fLen = frames.length;
			if(fLen > totalLength)
				totalLength = fLen;
			for(var f = 0; f < fLen;)
			{
				var frame = frames[f];
				if(frame.name)
				{
					outputObj.labels[frame.name] = f;
				}
				f += frame.duration;
			}
		}
		// set up information on the pngs that would be exported
		var data = {};
		outputObj.frames = [data];

		// the name of the clip with a # to replace with the frame number
		data.name = symbolName + "#";
		
		// flash frame numbers start at 0 when you use the spritesheet exporter
		data.min = 0;
		
		// go until the end
		data.max = timeline.frameCount - 1;
		
		// flash frame numbers always have 4 digits
		data.digits = 4;

		//get the origin
		var left = 100000000;
		var top = 100000000;

		for (var i = 1, len = timeline.frameCount + 1; i < len; ++i)
		{
			var bounds = timeline.getBounds(i, false);//don't get hidden layers, aka the masks and guides we just hid
			if(bounds.left < left)
				left = bounds.left;
			if(bounds.top < top)
				top = bounds.top;
		}
		outputObj.origin = {x: -left * scale, y: -top * scale};
		
		//apply scaling if not 1
		if(scale != 1)
		{
			library = this.dom.library;
			selectedItem.name = "EBMC_TEMP";
			library.addNewItem("movie clip", symbolName);
			scaledItem = library.items[library.findItemIndex(symbolName)];
			library.editItem(symbolName);
			library.addItemToDocument({x:0, y:0}, symbolPath + "EBMC_TEMP");
			var element = scaledItem.timeline.layers[0].frames[0].elements[0];
			element.symbolType = "graphic";
			element.scaleX = scale;
			element.scaleY = scale;
			scaledItem.timeline.insertFrames(1, true, totalLength - 1);
		}

		//export the movieclip data
		var uri = fl.browseForFileURL("save", "Select a file to save the movieclip data for " + symbolName, "JSON Files (*.json)", "json");
		if (uri)
		{
			FLfile.write(uri, JSON.stringify(outputObj));
		}
		
		//For Windows, we need to supply a single file type, otherwise it gets all weird,
		//especially when not supplying an extension.
		uri = fl.browseForFileURL("save", "Select a file to save the spritesheet (png + json atlas) for " + symbolName, "Images (*.png)", "png");
		
		if (uri)
		{
			//strip off the extension, so that we can use it for both .json and .png
			if(uri.lastIndexOf(".") > 0)
				uri = uri.substring(0, uri.lastIndexOf("."));
			
			var exporter = new SpriteSheetExporter();
			exporter.layoutFormat = "JSON";
			exporter.algorithm = "maxRects";
			exporter.allowRotate = false;
			exporter.allowTrimming = true;
			exporter.autoSize = true;
			exporter.maxSheetWidth = 2048;
			exporter.maxSheetHeight = 2048;
			exporter.shapePadding = 1;
			exporter.stackDuplicateFrames = true;
			exporter.addSymbol(scaledItem || selectedItem);
			if(exporter.overflowed)
				fl.trace("WARNING: Unable to fit all frames in 2048x2048 spritesheet");
			exporter.exportSpriteSheet(uri ,{
				format:"png",
				bitDepth:32,
				backgroundColor:"#00000000"
			});
			
			//read the published texture atlas and get rid of *sequential* duplicate frames, they
			//are easily reassembled by the TextureAtlas class used by BitmapMovieClip
			var exportedJSON = JSON.parse(FLfile.read(uri + ".json"));
			frames = exportedJSON.frames;
			var prevObj;
			for(var id in frames)
			{
				var obj = frames[id];
				if(typeof obj != "object")
					continue;
				if(prevObj)
				{
					if(areFramesEqual(prevObj, obj))
					{
						delete frames[id];
						continue;
					}
				}
				prevObj = obj;
			}
			JSON.prettyPrint = false;
			FLfile.write(uri + ".json", JSON.stringify(exportedJSON));
		}
		
		//undo scaling if not 1
		if(scale != 1)
		{
			library.deleteItem(symbolName);
			selectedItem.name = symbolName;
		}
	};
	
	function areFramesEqual(obj1, obj2)
	{
		/*
		"frame": {"x":0,"y":152,"w":118,"h":151},
		"rotated": false,
		"trimmed": false,
		"spriteSourceSize": {"x":0,"y":0,"w":118,"h":151},
		"sourceSize": {"w":118,"h":151},
		"pivot": {"x":0,"y":0}
		*/
		if(obj1.trimmed != obj2.trimmed)
			return false;
		if(obj1.rotated != obj2.rotated)
			return false;
		var compare1 = obj1.frame, compare2 = obj2.frame;
		if(compare1.x != compare2.x || compare1.y != compare2.y || compare1.w != compare2.w ||
			compare1.h != compare2.h)
		{
			return false;
		}
		compare1 = obj1.spriteSourceSize;
		compare2 = obj2.spriteSourceSize;
		if(compare1.x != compare2.x || compare1.y != compare2.y || compare1.w != compare2.w ||
			compare1.h != compare2.h)
		{
			return false;
		}
		compare1 = obj1.sourceSize;
		compare2 = obj2.sourceSize;
		if(compare1.w != compare2.w || compare1.h != compare2.h)
		{
			return false;
		}
		compare1 = obj1.pivot;
		compare2 = obj2.pivot;
		if(compare1 && compare2 && (compare1.x != compare2.x || compare1.y != compare2.y))
		{
			return false;
		}
		return true;
	}
	
	// Run script
	new BitmapMovieClip();
	
}());