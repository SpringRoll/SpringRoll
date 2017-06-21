// import '@springroll/animation';
// import '@springroll/captions';
// import '@springroll/container-client';
// import '@springroll/core';
// import '@springroll/debug';

import {Application} from '@springroll/core/lib/core';

// import '@springroll/display';
// import '@springroll/display-animation';
// import '@springroll/display-ui';
// import '@springroll/hints';
// import '@springroll/languages';
// import '@springroll/loaders';
// import '@springroll/sound';
// import '@springroll/states';
// import '@springroll/ui';

/// eslint-disable-next-line no-undef
console.log('springroll.Application', new Application({}));
console.log(springroll);

// // Include classes
// var Application = include('springroll.Application'),
//     EaselJSDisplay = include('springroll.EaselJSDisplay'),
//     Shape = include('createjs.Shape');

// // Create the new application
// var app = new Application({
//     canvasId: "stage",
//     debug: true,
//     display: EaselJSDisplay
// });

// // Wait until the app is ready
// app.once('init', function()
// {
//     var shape = new Shape();
//     shape.graphics.beginFill("#69a1df")
//         .drawCircle(400, 250, 100);

//     // Add it to the EaselJS stage
//     this.display.stage.addChild(shape);
// });
