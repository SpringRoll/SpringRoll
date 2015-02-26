(function(){

	/**
	 * Export a Bitmap sequence for all frame labels on the
	 * current timeline.
	 * @class  ImageFrames
	 */
	var ImageFrames = function()
	{
		// Check for document
		this.dom = fl.getDocumentDOM();
		if (!this.dom) return;

		var folderURI = fl.browseForFolderURL("Select an export location");

		if (!folderURI) return;
		
		folderURI += "/";

		var timeline = this.dom.getTimeline();
		var layers = timeline.layers;
		var layerLen = timeline.layerCount;

		for (var l = 0; l < layerLen; ++l)
		{
			var layer = layers[l];
			var frameLen = layer.frameCount;

			for (var f = 0; f < frameLen;)
			{
				var frame = layer.frames[f];
				if (frame.name)
				{
					var uri = folderURI + frame.name + ".png";
					timeline.currentFrame = f;
					this.dom.exportPNG(uri, true, true);
				}

				// Goto the next keyframe
				f += frame.duration;
			}
		}
	};

	new ImageFrames();

}());