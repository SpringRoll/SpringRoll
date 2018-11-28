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

`UserData` is a class that handles communication between your SpringRoll Application and Container

```javascript
import { UserData } from 'springroll'

UserData.write('my-value', {foo:'bar'});

UserData.read('my-value', (response) => console.log(response));

UserData.delete('my-value');

```
