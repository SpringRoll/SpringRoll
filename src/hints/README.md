# Hints

## HintSequencePlayer

The HintSequencePlayer is an easy way to allow you to play hints.

| Name | Time | Params |
| --- | --- | --- |
| `play()` | Invokes a single hint callback | |
| `add(...cb)` | Adds a hint callback | Function(s) |
| `remove(...cb)` | Removes a hint callback  | Function(s) |
| `clear()` | Removes all hint callbacks | |

Hints are played in the order they are added.
```javascript
import { HintSequencePlayer } from 'springroll';

const hints = new HintSequencePlayer();

const hint1 = () => {
  console.log('hint 1');
}

const hint2 = () => {
  console.log('hint 2');
}

const hint3 = () => {
  console.log('hint 3');
}

hints.add(hint1, hint2, hint3);

hints.play() // --> hint 1
hints.play() // --> hint 2
hints.play() // --> hint 3
hints.play() // --> hint 1

```

The Springroll Application comes with a HintSequencePlayer attached by default. `play` will automatically be invoked when the Bellhop `playHelp` event is received.
```javascript
import { Application } from 'springroll';

const app = new Application();
app.hints.add(() => {
  console.log('this is a hint');
});

app.hints.play(); // --> this is a hint
```

## IHintPlayer

if you need a special behaviour for handling hints you can create your own IHintPlayer implementation and pass it to the Applications constructor.

```javascript
import { Application, IHintPlayer } from 'springroll';

class HintExamplePlayer extends IHintPlayer
{
  play()
  {
    console.log('My Special Behaviour');
  }
}

const app = new Application({
  hintPlayer: new HintExamplePlayer();
})

app.hints.play(); // --> My Special Behaviour
```
## IdleTimer

The Idle Timer is a simple reset-able timer that can have multiple callbacks. After start is called it will automatically invoke callbacks after a set amount of time, unless it is reset or stopped.

| Name | Time | Params |
| --- | --- | --- |
| `start(time)` | Starts the timer | milliseconds |
| `stop()` | Stops the timer | |
| `reset()` | Sets time back to zero | |
| `subscribe(cb)` | Adds a callback | Function |
| `unsubscribe(cb)` | Removes a callback | Function |

```javascript
import { IdleTimer } from 'springroll';

const timer = new IdleTimer();
timer.subscribe(() => {
  console.log('15 seconds');
});
timer.start(15000);
```

It can be use in conjunction with a hint player to give players hints after a period of inactivity or improper input.

```javascript
import { Application, IdleTimer } from 'springroll';
import { SpringrollConfig } from './config';

class MyGameState
{
  constructor() {
    this.app = new Application(SpringrollConfig);
    this.app.hints.add(this.showHint.bind(this));

    this.idleTimer = new IdleTimer();
    this.idleTimer.subscribe(() => {
      this.app.hints.play();
    });
  }

  start() {
    this.idleTimer.start(15000);
  }

  showHint() {
    this.game.showText('press the continue button to progress!');
  }

  onContinuePressed() {
    this.idleTimer.reset();
    //... More game logic
  }
}
```


