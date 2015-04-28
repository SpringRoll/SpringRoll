// Import classes
var LearningDispatcher = include('springroll.LearningDispatcher'),
	Application = include('springroll.Application'),
	LearningDispatcherError = include('springroll.LearningDispatcherError'),
	ValidationError = include('springroll.LearningDispatcherError');

$.getJSON('data/spec.json', function(spec){

	// Throw errors, it will make it easier to validate
	LearningDispatcher.throwErrors = true;

	// Our base learning object
	var learning;
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

	// Create the progress learning
	test('Created Learning Dispatcher', function(assert){
		expect(1);
		learning = new LearningDispatcher(app, spec);
		learning.showTray = true;
		assert.ok(!!learning, "Created an empty learning");
	});

	// Handle a properly triggered track event
	test('Trigger Track Event', function(assert){
		expect(4);
		stop();
		learning.on('learningEvent', function(data){
			start();
			assert.strictEqual(data.event_data.version, 4, "Version sent through startGame");
			assert.strictEqual(data.event_data.event_code, 2000, "Event code validation");
			assert.strictEqual(data.game_id, spec.gameId, "Game id validation");
			assert.strictEqual(data.event_id, spec.events["2000"].id, "Event id validation");
			learning.off('learningEvent');
		});
		learning.startGame();
	});

	// Handle validation error
	test('Validation Errors', function(assert){
		expect(4);
		try 
		{
			learning.startInstruction(1, 1000, "description", "id");
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
		learning.on('learningEvent', function(data){
			start();
			assert.deepEqual(data.event_data.options, options, "Passing array argument");
			assert.deepEqual(data.event_data.round_target, target, "Passing object argument");
			learning.off('learningEvent');

			try 
			{
				target.size = "fail";
				learning.startRound(1, target, options, animals, 1);	
			}
			catch (e)
			{
				assert.ok(e instanceof ValidationError, "Nested validation");
				assert.strictEqual(e.property, "round_target.size", "Nested targeting");
			}
		});
		learning.startRound(1, target, options, animals, 1);
	});

	test("Convenience Timers", function(assert){
		expect(3);
		learning.startTimer('example');
		stop();
		setTimeout(function(){
			start();
			var poll = learning.pollTimer('example');
			var total = learning.stopTimer('example');
			assert.ok(total > 0, "Timer is available");
			assert.strictEqual(poll, total, "Got timer same as poll")
			try
			{
				learning.stopTimer('example');
			}
			catch(e)
			{
				assert.ok(!!e, "Cannot stop already stopped timer");
			}
		}, 100);
	});

	test("Convenience Feedback Methods", function(assert){

		expect(2);

		learning.startInstruction("Pick the correct button", "PickButton", "audio", 1000);
		learning.endInstruction();

		learning.startIncorrectFeedback("Sorry, that's wrong", "SorryWrong", "audio", 1000);
		learning.endIncorrectFeedback();

		learning.startCorrectFeedback("You were correct", "Correct", "audio", 1000);
		learning.endCorrectFeedback();

		try 
		{
			learning.endCorrectFeedback();
		}
		catch (e)
		{
			assert.ok(true, "Can't call end method before beginning");
		}
		assert.ok(true, "Feedback tests");
	});

	test("Convenience Movie Methods", function(assert){

		learning.startMovie("Intro", 2000, "Introduction to the game, cinematic");
		learning.skipMovie();
		try 
		{
			learning.stopMovie();
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
			learning.startMovie(1, 2, 3, 4, 5);
		}
		catch (e)
		{
			assert.ok(e instanceof LearningDispatcherError, "More arguments");
		}
		try
		{
			learning.startMovie(1);
		}
		catch (e)
		{
			assert.ok(e instanceof LearningDispatcherError, "Less arguments");
		}
	});

	// Clean up the learning
	test('Cleanup Learning Dispatcher', function(assert){
		expect(1);
		learning.destroy();
		learning = null;
		assert.ok(true, "LearningDispatcher destroyed");
	});
});