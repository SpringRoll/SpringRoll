var Application = include('springroll.Application');
// var LearningGame = include('springroll.LearningGame');

test('Include All Modules', function(assert){
	expect(2);
	var app = new Application();
	assert.ok(!!Application.instance, "Created a blank application");
	app.destroy();
	assert.ok(!Application.instance, "Application is destroyed");
});

// test('Create a LearningGame', function(assert){
// 	expect(1);
// 	var game = new LearningGame({
// 		name: "TestGame"
// 	});
// 	assert.ok(!!game, "Created an empty game");
// 	//game.destroy();
// });