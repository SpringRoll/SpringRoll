# Caption Player 
The CaptionPlayer object provides a simplified way to handle playing captions in your game.

### Initializing
In order to play a caption you'll first need to initialize a captions player.

```javascript
  import { CaptionPlayer, CaptionFactory } from 'springroll/localization'

  // Start and end times are in Milliseconds
  let captionData = {
    "welcome":[
      {
        "content": "This is the first line"
        "start":0,
        "end": 1200
      },
      {
        "content": "This is the second line"
        "start":1300,
        "end": 2400
      }
    ],
    "other":[
      {
        "content": "this caption only has on line"
        "start":0,
        "end": 3000
      }
    ]
  }

  let captionsElement = document.getElementById("captions");
  let captionMap = CaptionFactory.createCaptionMap(captionData);
  let captionPlayer = new CaptionPlayer(captionMap, captionsElement);
```
Each line in a caption must have a start and end time, if you want to have a delay between lines you should add time to the start of the next line. it's not recommended to use a line with an empty content.

[//]: # (this can probably be reworded)
if line `B`'s start time is before line `A`'s end time, then `A` will finish before `B` starts.

### Updating
the caption player needs to be updated regularly in order for it to function properly. It's recommended to call update every frame for the most accurate timing.  

```javascript
  // DeltaTime is the time passed in SECONDS since the last update call.
  captionPlayer.update(deltaTime); 
```

### Playing a caption
to start playing a captions you call start. you can pass a start time in as an optional parameter.

```javascript
  captionPlayer.start('welcome');
```

```javascript
  captionPlayer.start('welcome', 1200);
```
__Note:__ the CaptionPlayer can only play one caption at a time

### Stopping a caption
captions automatically stop when the time passed is greater than the end time. but you can manually stop them if you need to.

```javascript
  captionPlayer.stop();
```

### _Example:_
```javascript
class YourGame
{
  preload()
  {
    this.loader.load('assets/captions.json', 'captionData');
  }

  start()
  {
    let captionsElement = document.getElementById("captions");
    let captionMap = CaptionFactory.createCaptionMap(this.cache.getJSON('captionData'));
    this.captionPlayer = new CaptionPlayer(captionMap, captionsElement);

    this.captionPlayer.start('example');
  }

  update()
  {
    this.captionPlayer.update(this.Time.DeltaTime * this.Time.scale);
  }
}
```

[//]: # (TODO: add links to jsDoc)