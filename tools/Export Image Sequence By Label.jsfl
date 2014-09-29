(function(){
    var doc = fl.getDocumentDOM();
    
    var folderURI = fl.browseForFolderURL("Select a folder to export to");
    if(!folderURI)
        return;
    folderURI += "/";
    var timeline = doc.getTimeline();
    var layers = timeline.layers;
    for(var l = 0, layerLen = timeline.layerCount; l < layerLen; ++l)
    {
        var layer = layers[l];
        for(var f = 0, frameLen = layer.frameCount; f < frameLen;)
        {
            var frame = layer.frames[f];
            if(frame.name)
            {
                var uri = folderURI + frame.name + ".png";
                timeline.currentFrame = f;
                doc.exportPNG(uri, true, true);
            }
            f += frame.duration;
        }
    }
}());