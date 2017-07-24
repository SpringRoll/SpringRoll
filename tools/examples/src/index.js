// Import Application from core package
import {Application} from '@springroll/core';

// Create a new SpringRoll Application
// alternatively "new springroll.Application()"
const app = new Application();

// Listen for the 'ready' event to ensure all
// plugins have been initialized
app.on('ready', function() {
    console.log('Ready!');
});