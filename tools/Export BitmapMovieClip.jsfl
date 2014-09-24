//make sure JSON exists
(function(global){
	
	if(global.JSON) return;
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

(function(){

	JSON.prettyPrint = true;

	
	var doc = fl.getDocumentDOM();
	var library = doc.library;
	var selectedItems = library.getSelectedItems();
	if(selectedItems.length == 0)
	{
		alert("You must have one or more movieclips selected in the library to export.");
		return;
	}
	for(var i = 0; i < selectedItems.length; ++i)
	{
		var item = selectedItems[i];
		if(item.itemType == "movie clip" || item.itemType == "graphic")
			exportClip(item);
	}

	function exportClip(selectedItem)
	{
		//Unfortunately, resizing all of the things on the timeline isn't reliable enough - sometimes it fails to set
		//height or width properly for some reason
		/*var scale = parseFloat(prompt("Enter scale to export at", "1")) || 1;
		if(scale != 1)
			resizeClip(selectedItem.timeline, scale);*/
		var symbolName = selectedItem.name.substring(selectedItem.name.indexOf("/") + 1);
		var scale = prompt("What scale is " + symbolName + " being exported at?\n(press cancel to skip this movieclip)", "1");
		if(scale == null)
			return;
		else if(parseFloat(scale) > 0)
			scale = parseFloat(scale);
		else
			scale = 1;
		var outputObj = {};
		//keep track of this for proper reassembly
		outputObj.scale = scale;
		outputObj.fps = doc.frameRate;
		outputObj.labels = {};
		//get all those pesky frame labels
		var timeline = selectedItem.timeline;
		var layers = timeline.layers;
		for(var l = 0, lLen = layers.length; l < lLen; ++l)
		{
			var layer = layers[l];
			if(layer.layerType == "folder") continue;
			//hide guide/mask layers and show everything else, for origin calculation purposes
			layer.visible = layer.layerType != "guide" && layer.layerType != "mask";

			var frames = layer.frames;
			for(var f = 0, fLen = frames.length; f < fLen;)
			{
				var frame = frames[f];
				if(frame.name)
				{
					outputObj.labels[frame.name] = f;
				}
				f += frame.duration;
			}
		}
		//set up information on the pngs that would be exported
		var data = {};
		outputObj.frames = [data];
		data.name = symbolName + "#";//the name of the clip with a # to replace with the frame number
		data.min = 0;//flash frame numbers start at 0 when you use the spritesheet exporter
		data.max = timeline.frameCount - 1;//go until the end
		data.digits = 4;//flash frame numbers always have 4 digits
		//get the origin
		var left = 100000000;
		var top = 100000000;
		for(var i = 1, len = timeline.frameCount + 1; i < len; ++i)
		{
			var bounds = timeline.getBounds(i, false);//don't get hidden layers, aka the masks and guides we just hid
			if(bounds.left < left)
				left = bounds.left;
			if(bounds.top < top)
				top = bounds.top;
		}
		outputObj.origin = {x: -left, y: -top};
		//export the movieclip data
		var uri = fl.browseForFileURL("save", "Select a file to save the movieclip data for " + symbolName, "JSON Files (*.json)", "json");
		if(uri)
			FLfile.write(uri, JSON.stringify(outputObj));
		uri = fl.browseForFileURL("save", "Select a file to save the spritesheet (png + json atlas) for " + symbolName);
		if(uri)
		{
			if(uri.lastIndexOf(".") > 0)
				uri = uri.substring(0, uri.lastIndexOf("."));
			var exporter = new SpriteSheetExporter();
			exporter.layoutFormat = "JSON";
			exporter.algorithm = "maxRects";
			exporter.allowRotate = false;
			exporter.allowTrimming = true;
			exporter.autoSize = true;
			exporter.shapePadding = 1;
			exporter.stackDuplicateFrames = true;
			exporter.addSymbol(selectedItem);
			exporter.exportSpriteSheet(uri ,{format:"png", bitDepth:32, backgroundColor:"#00000000"})
		}
		/*if(scale != 1)
			resizeClip(selectedItem.timeline, 1 / scale);

		function resizeClip(clipTimeline, scale)
		{
			var layers = clipTimeline.layers;
			for(var l = 0, lLen = layers.length; l < lLen; ++l)
			{
				var frames = layers[l].frames;
				for(var f = 0, fLen = frames.length; f < fLen;)
				{
					var frame = frames[f];
					var elements = frame.elements;
					for(var e = 0, eLen = elements.length; e < eLen; ++e)
					{
						var element = elements[e];
						var w = element.width, h = element.height, x = element.x, y = element.y;
						element.width = w * scale;
						element.height = h * scale;
						element.x = x * scale;
						element.y = y * scale;
					}
					f += frame.duration;
				}
			}
		}*/
	}
}());