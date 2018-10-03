# Scale Manager

A utility class for listen for resize events.

```javascript
var scaleManager = new ScaleManager(function(resizeData) {
  console.log('This is called on window resize');

  console.log('Window width is', resizeData.width);
  console.log('Window height is', resizeData.height);
  console.log('Window aspect ratio is', resizeData.ratio);
});
```

If you do not have a listener ready at the time of construction or you need to replace the existing listener, the
`enable` method exists for that purpose:

```javascript
scaleManager.enable(function(resizeData) {
  console.log('The old listener is replaced with this one!', resizeData);
});
```
