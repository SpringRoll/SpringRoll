## Property
`Property` is a class that monitors a value and notifies listeners whenever it has changed.

```javascript
// creates the property, defaulting the value to false
const isPaused = new Property(false);

// subscribe for changes to the property
isPaused.subscribe(function(newValue, oldValue) {
  console.log('Value changed from', oldValue, 'to', newValue);
});

// the property can change similarly to the previous case, the handler triggering appropriately
isPaused.value = true;
```


## UserData

The `UserData` provides a mechanism for storing game/session data _outside of the game instance_ by saving it in
`localStorage` at the Container level. This mechanism can be used to share information across games on the same domain.

```javascript
import { UserData } from 'springroll'

UserData.write('my-value', { foo:'bar' })
  .then(() => console.log('Value saved'));

UserData.read('my-value')
  .then(value => console.log('Value retrieved:', value));

UserData.delete('my-value');

```
