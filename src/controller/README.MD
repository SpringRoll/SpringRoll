# Controller

Controller is a interface class that makes it easier to interact user key inputs

```
import { Controller } from ...

const controller = new Controller({
  ArrowLeft: () => {},
  ArrowDown: () => {},
  ArrowRight: () => {},
  ArrowUp: () => {},
  Enter: () => {},
  " ": () => {},
  "Space Bar": => {}
});
```
- values can be found here https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values

- Values are case insensitive


The controller will monitor key inputs for you. Call the update function for when you wish to call the functions that are related to the currently active keys.

```
controller.update();
```

if any time you wish to change the keys currently being watched you can call the assignButtons function.

```
controller.assignButtons({
  a: () => {},
  s: () => {},
  d: () => {},
  w: () => {},
  Enter: () => {},
  " ": () => {},
  "Space Bar": => {}
});
```

