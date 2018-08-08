# State Manager

A class for managing a group of subscribable properties together. Allows for the registration of new properties.

For example:
```
var manager = new StateManager();
manager.addField('paused', false);
manager.paused.subscribe(function(newValue) {
  console.log('New value is ', newValue);
})

manager.paused = true;
```