var Application = include('springroll.Application');

test('Include All Modules', function(assert){
	expect(2);
	var app = new Application();
	assert.ok(!!Application.instance, "Created a blank application");
	app.destroy();
	assert.ok(!Application.instance, "Application is destroyed");
});