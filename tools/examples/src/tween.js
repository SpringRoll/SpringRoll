// Import modules
import {Graphics} from 'pixi.js';
import {Application} from '@springroll/core';
import '@springroll/display';

// Lots of tween libraries, for this example
// we will use https://github.com/tweenjs/tween.js
import TWEEN from '@tweenjs/tween.js';

// Create the new springroll application
const app = new Application({
    display: { backgroundColor: 0x1e528c }
});

app.on('ready', function() {

    // Draw a circle using Pixi.js
    const shape = new Graphics()
        .beginFill(0x69a1df)
        .drawRect(0, 0, 100, 100);

    // Center in the middle of the stage
    shape.position.set(50, 300);
    shape.pivot.set(50, 50);

    // Render the shape
    app.display.stage.addChild(shape);

    // Basic tween back and forth using
    // https://github.com/tweenjs/tween.js
    function beginTween() {
        new TWEEN.Tween(shape)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .to({ x: [750, 50], rotation: [Math.PI * 2, 0] }, 3000)
            .onComplete(beginTween) // loop
            .start();
    }

    // SpringRoll easily hooks up to any 
    // tween library, please use SpringRoll's update
    // and to **not** use a separate setTimeout
    // or requestAnimationFrame loop
    app.on('update', function(elapsed, time) {
        TWEEN.update(time);
    });

    beginTween();
});