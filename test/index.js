test('Include All Modules', function(assert){
	expect(1);
	var Application = cloudkid.Application;
	var app = new Application();
	assert.ok(!!Application.instance, "Created a blank application");
	app.destroy();
});