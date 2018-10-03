# State Manager
The `StateManager` is a class that manages a group of subscribable [`Property`](./Property.js) instances.
The provides functionality for registration of new properties, and for subscribing to existing properties.

An example usage:

```javascript
var manager = new StateManager();

// adds a new field called 'paused' to the manager, and sets it initially to false
manager.addField('paused', false);

// listen for any changes on the newly created 'paused' field.
manager.paused.subscribe(function(newValue, oldValue) {
  console.log('Value changed from', oldValue, 'to', newValue);
})

// change the field's value, which will trigger the handler above
manager.paused.value = true;
```

## Standalone Property instances
A `Property` instance can also be instantiated individually without using a `StateManager`:

```javascript
// creates the property, defaulting the value to false
const isPaused = new Property(false);

// subscribe for changes to the property
isPaused.subscribe(function(newValue, oldValue) {
  console.log('Value changed from', oldValue, 'to', newValue);
});

// the property can be changed similar to the previous case, and the handler will be triggered appropriately
isPaused.value = true;
```
