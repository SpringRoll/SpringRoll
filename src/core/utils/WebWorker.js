/**
 * @module Core
 * @namespace springroll
 * @class WebWorker
 * @param {Object, Function}
 */


/**
 *  A class for running code on a different thread in nice and concise way.
 *  Web Worker has no access to the DOM aka. (document, window, canvas or any DOM element)
 *  
 *  For example:
 *
 *  WebWorker(
 *  {
 *	    var1: 200, // passing in a variable that can later be referenced with worker.var1
 *	    destroy: true, // destroy the web worker when the code is done. Default: true
 *	    run: function(worker)
 *	    {
 *			// the code that you want to run in the web worker
 *	    	postMessage(worker.var1 + 1); // data that you want to send back to the main code
 *	    }
 *	}, function(e) 
 *	{
 *		// code that you want to run when the web worker is done. 
 *		// event object (e) with data is also sent back
 *	    console.log(e.data);
 *	});
 */


(function(window)
{

	var WebWorker = function(prop, callback)
	{
		// turn the run function in to a string
		var str = prop.run.toString();
		var destroy = prop.destroy;

		// delete the run function and destroy property from the prop object
		delete prop.run;
		delete prop.destroy;

		// stringify the prop object and pass it in to the workerFunc function
		str = 'var workerFunc = ' + str + '; workerFunc(' + JSON.stringify(prop) + ');';

		// if destroy then add close() to the end of the string so the worker will close when done
		if (destroy || destroy === undefined)
		{
			str = str + ' close();';
		}

		// create new worker from the object url of a js blob created from str
		var worker = new Worker(window.URL.createObjectURL(new Blob([str],
		{
			type: 'text/javascript'
		})));

		// add message event listener to worker and when called run the callback function
		worker.addEventListener('message', function(e)
		{
			callback(e);
			// remove message event listener if the worker is destroyed 
			if (destroy || destroy === undefined)
			{
				worker.removeEventListener('message', arguments.callee);
			}
		}, false);


		return worker;
	};


	namespace('springroll').WebWorker = WebWorker;

}(window));