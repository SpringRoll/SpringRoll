# Scale Manager
A utility class that listens for resize events.

```javascript
var scaleManager = new ScaleManager(function(resizeData) {
  console.log('This is called on window resize');

  console.log('Window width is', resizeData.width);
  console.log('Window height is', resizeData.height);
  console.log('Window aspect ratio is', resizeData.ratio);
});
```

The `enable` method exists in case you do not have a listener ready at the time of construction or need to replace the
existing listener.

```javascript
scaleManager.enable(function(resizeData) {
  console.log('The old listener is replaced with this one!', resizeData);
});
```
