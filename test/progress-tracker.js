// Import classes
var ProgressTracker = include('springroll.ProgressTracker'),
	Application = include('springroll.Application'),
	ProgressTrackerError = include('springroll.ProgressTrackerError'),
	ValidationError = include('springroll.ProgressTrackerError');

$.getJSON('data/spec.json', function(spec){

	// Throw errors, it will make it easier to validate
	ProgressTracker.throwErrors = true;

	// Our base tracker object
	var tracker;
	var app = new Application();

	// Validate the loaded API
	test('Load API', function(assert){
		expect(5);
		assert.ok(!!spec.gameId, "Game API spec has gameId");
		assert.strictEqual(typeof spec.gameId, "string", "API gameId is a string");
		assert.ok(!!spec.version, "Game API spec has version");
		assert.strictEqual(parseInt(spec.version), spec.version, "API version is an integer");
		assert.strictEqual(typeof spec.events, "object", "Game API spec has events collection");
	}); 

	// Create the progress tracker
	test('Created Progress Tracker', function(assert){
		expect(1);
		tracker = new ProgressTracker(app, spec);
		tracker.showTray = true;
		assert.ok(!!tracker, "Created an empty tracker");
	});

	// Handle a properly triggered track event
	test('Trigger Track Event', function(assert){
		expect(4);
		stop();
		tracker.on('track', function(data){
			start();
			assert.strictEqual(data.event_data.version, 4, "Version sent through startGame");
			assert.strictEqual(data.event_data.event_code, 2000, "Event code validation");
			assert.strictEqual(data.game_id, spec.gameId, "Game id validation");
			assert.strictEqual(data.event_id, spec.events["2000"].id, "Event id validation");
			tracker.off('track');
		});
		tracker.startGame();
	});

	// Handle validation error
	test('Validation Errors', function(assert){
		expect(4);
		try 
		{
			tracker.startInstruction(1, 1000, "description", "id");
		}
		catch(e)
		{
			assert.ok(e instanceof ValidationError, "Created validation error");
			assert.strictEqual(e.api, "startInstruction", "API name from error");
			assert.strictEqual(e.eventCode, "3010", "Check for event code");
			assert.strictEqual(e.property, "media_type", "Parameter name from error");
		}
	});
	// Test the handling of complex arguments
	test('Complex Argument Types', function(assert){
		expect(4);
		var target = {
			size: 1,
			type: "tub",
			animal: "Pig"
		};
		var options = [1, 2, 3];
		var animals = ["Pig", "Hog", "Cow"];

		stop();
		tracker.on('track', function(data){
			start();
			assert.deepEqual(data.event_data.options, options, "Passing array argument");
			assert.deepEqual(data.event_data.round_target, target, "Passing object argument");
			tracker.off('track');

			try 
			{
				target.size = "fail";
				tracker.startRound(1, target, options, animals, 1);	
			}
			catch (e)
			{
				assert.ok(e instanceof ValidationError, "Nested validation");
				assert.strictEqual(e.property, "round_target.size", "Nested targeting");
			}
		});
		tracker.startRound(1, target, options, animals, 1);
	});

	test("Convenience Timers", function(assert){
		expect(3);
		tracker.startTimer('example');
		stop();
		setTimeout(function(){
			start();
			var poll = tracker.pollTimer('example');
			var total = tracker.stopTimer('example');
			assert.ok(total > 0, "Timer is available");
			assert.strictEqual(poll, total, "Got timer same as poll")
			try
			{
				tracker.stopTimer('example');
			}
			catch(e)
			{
				assert.ok(!!e, "Cannot stop already stopped timer");
			}
		}, 100);
	});

	test("Convenience Feedback Methods", function(assert){

		expect(2);

		tracker.startInstruction("Pick the correct button", "PickButton", "audio", 1000);
		tracker.endInstruction();

		tracker.startIncorrectFeedback("Sorry, that's wrong", "SorryWrong", "audio", 1000);
		tracker.endIncorrectFeedback();

		tracker.startCorrectFeedback("You were correct", "Correct", "audio", 1000);
		tracker.endCorrectFeedback();

		try 
		{
			tracker.endCorrectFeedback();
		}
		catch (e)
		{
			assert.ok(true, "Can't call end method before beginning");
		}
		assert.ok(true, "Feedback tests");
	});

	test("Convenience Movie Methods", function(assert){

		tracker.startMovie("Intro", 2000, "Introduction to the game, cinematic");
		tracker.skipMovie();
		try 
		{
			tracker.stopMovie();
		}
		catch (e)
		{
			assert.ok(true, "Can't stop a movie that's already been skipped");
		}
		assert.ok(true, "Movie tests");
	});

	// Check for arguments length errors
	test("Argument Length", function(assert){
		expect(2);
		try
		{
			tracker.startMovie(1, 2, 3, 4, 5);
		}
		catch (e)
		{
			assert.ok(e instanceof ProgressTrackerError, "More arguments");
		}
		try
		{
			tracker.startMovie(1);
		}
		catch (e)
		{
			assert.ok(e instanceof ProgressTrackerError, "Less arguments");
		}
	});

	// Clean up the tracker
	test('Cleanup Progress Tracker', function(assert){
		expect(1);
		tracker.destroy();
		tracker = null;
		assert.ok(true, "ProgressTracker destroyed");
	});
});