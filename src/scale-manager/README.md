# Scale Manager
A utility class that listens for resize events.





```javascript
let scaleManager = new ScaleManager({
  width: 1320,
  height: 780,
  callback: function(resizeData) {
    console.log('This is called on window resize');

    console.log('game width is', resizeData.width);
    console.log('game height is', resizeData.height);
    console.log('game scale is', resizeData.scale);
  }
});
```

The `enable` method exists in case you do not have a listener ready at the time of construction or need to replace the
existing listener.

```javascript
scaleManager.enable(function(resizeData) {
  console.log('The old listener is replaced with this one!', resizeData);
});
```

**Note:** There is a 500ms delay added to the event to solve an issues where on some browsers the window isn't fully resized before the event fires.