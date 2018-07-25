# Controller

Controller is a interface class that makes it easier to interact with user key inputs.

It accepts a array of objects that follow this format `Object {key: string, down?: function, up?: function}`

```
import { Controller } from ...

const controller = new Controller([
  { key: 'ArrowLeft', down: () => console.log('left arrow pushed down!')},
  { key: 'ArrowDown', down: () => console.log('down arrow pushed down!')},
  { key: 'ArrowRight', down: () => console.log('right arrow pushed down!')},
  { key: 'ArrowUp', down: () => console.log('up arrow pushed down!')},
  { key: 'Enter', down: () => console.log('enter pushed down!')},
  { key: ' ', down: () => console.log('space bar pushed down!'), up: () => console.log('space bar stopped being pushed down!')},
]);
```
- Key values can be found [here](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)

- Key values are case insensitive.

The controller will monitor key inputs for you. Call the function when you wish to call the functions that are related to the currently active keys.

```
controller.update();
```

If at any time you wish to change the keys currently being watched, you can call the assignButtons function. This follows the same format as the constructor:

```
controller.assignButtons([
  { key: 'a', down: () => console.log('a pushed down!')},
  { key: 's', down: () => console.log('s pushed down!')},
  { key: 'd', down: () => console.log('d pushed down!')},
  { key: 'w', down: () => console.log('w arrow pushed down!')},
  { key: 'Enter', down: () => console.log('enter pushed down!')},
  { key: ' ', down: () => console.log('space bar pushed down!'), up: () => console.log('space bar stopped being pushed down!')},
]);
```

