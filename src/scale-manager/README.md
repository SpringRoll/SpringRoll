# Scale Manager
A utility class that listens for resize events.

There is a 500ms delay added to the event to solve an issues where on some browsers the window isn't fully resized before the event fires.

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

# Safe Scale Manager
A utility class that listens for resize events and calculates the width and height your game should be to fit within the screen without stretching or squishing the game. 

```javascript
let scaleManager = new SafeScaleManager({
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

The `enable` method exists in case you do not have a listener ready at the time of construction or need to replace the existing listener. 

```javascript
scaleManager.enable(function(resizeData) {
  console.log('The old listener is replaced with this one!', resizeData);
});
```

**Note:** The Resize event will fire twice. A 500ms debounce was added to the event to solve an issues where on iOS the window inner height/width are not guaranteed to match actual the dimensions when the event fires.

For more info check out the [WebKit Bug](https://bugs.webkit.org/show_bug.cgi?id=170595).


### Callback Example

The safe scale manager's callback parameter contains `width`, `height`, `scale`, and `scaleRatio`. these values can be used to resize your game. Depending on the engine you choose you'll have to use them differently. `scale` contains `x` and `y`, these are the independent scaling values for the x and y axis. You may also need to use the `scaleRatio` value, this is the minimum size ratio either `width/safeWidth` or `height/safeHeight`

```javascript
scaleManager.enable(({width, height, scale}) => {
  // -- PIXI -- //
  const view = this.pixi.view;
  const stage = this.pixi.stage;
  const renderer = this.pixi.renderer;

  stage.position.set(renderer.width / 2, renderer.height / 2);
  stage.scale.set(scale.x, scale.y);

  stage.pivot.x = renderer.width / 2;
  stage.pivot.y = renderer.height / 2;

  view.style.width = width + 'px';
  view.style.height = height + 'px';

  view.style.position = 'absolute'
  view.style.left = '0px';
  view.style.top = '0px'; 
});
```

**Note**: A Phaser3 example can be found [here](https://github.com/SpringRoll/Springroll-Seed/tree/templates/phaser3)

## Safe Scaling
Safe scaling is enabled by setting `safeWidth` and `safeHeight` in the scaleManager's config. 

```javascript
let scaleManager = new SafeScaleManager({
  width: 1320,
  height: 780,
  safeWidth: 1024,
  safeHeight: 660,
  callback: pixiResize
});
```

This allows for the scale manager to calculate the canvas's target size and scale to ensure that the viewport's minimum is never smaller than `safeWidth` and `safeHeight`, and It's maximum never larger than `width` and `height`.

## Scaled Entities

If your game has any code that needs to be updated after the game resizes it can be implemented as a ScaledEntity. A ScaledEntity's `onResize` function is automatically called by the ScaleManager.

```javascript
class MyEntity extends ScaledEntity
{
  onResize({offset, scale, gameSize})
  {
    //Resize dependant code.
  }
}

const myEntity = new MyEntity();

scaleManager.addEntity(myEntity);
scaleManager.removeEntity(myEntity);

```

| Parameter | values | Description |
|---|---|---|
|`offset`| `x,y` | distance calculated between the game size and the viewport size |
|`scale`| `x,y ` | scale values calculated for viewport |
|`gameSize`| `x,y` | actual game space size, set during scale manager initialization |

An example of a ScaledEntity might be offsetting a camera to keep the game in view.

```javascript
class CameraPositioner extends ScaledEntity
{
  constructor(camera)
  {
    super();
    this.camera = camera;
  }

  onResize({ offset, gameSize })
  {
    this.camera.setViewport(-offset.x, -offset.y, gameSize.x, gameSize.y);
  }
}
```

### Anchor

An Anchor is another example of a scaled entity provided by SpringRoll. It's primary use is to keep UI elements in a relative position regardless of the size of the viewport. For example if you always wanted to keep a health bar in the top left corner:

```javascript
const healthBar = new StatusBar("#ff0000"); // <-- not a springroll object.
const healthAnchor = new Anchor({
  position: { x: 66, y: 25 }, 
  direction: { x: -1, y: -1 }, 
  callback: (x, y) => healthBar.position.set(x, y)
});
scaleManager.addEntity(healthAnchor);
```

| Parameter | Description |
|---|---|
|`position`| desired `x,y` position of the element relative to the Anchor's `direction` |
|`direction`| `x,y` axis that the Anchor is attached to, `x:-1` is left, and `y:-1` is up. `x:0` and `y:0` locks the element to the center of the viewport. |
|`callback`| function to be call anytime the screen is resized, the parameters contain the `x,y` position in world space to set your object too. |
