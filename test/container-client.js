var Application = include('springroll.Application');
var SavedData = include('springroll.SavedData');
var app = new Application(
{
	name: 'test'
});

test('SavedData', function(assert)
{
	expect(3);

	var value = SavedData.read('doesnotexist');
	assert.strictEqual(value, null, 'Data does not exist');

	SavedData.write('choice', 1);
	assert.strictEqual(SavedData.read('choice'), 1, 'Write works');

	SavedData.remove('choice');
	assert.strictEqual(SavedData.read('choice'), null, 'Remove works');
});

test('UserData', function(assert)
{
	var done = assert.async();

	expect(4);

	assert.ok(!!app.userData, "Application userData property");

	// turn off iframe communication for the test
	app.container.supported = false;

	app.userData.write('highScore', 1000, function() {
		app.userData.read('highScore', function(value) {
			assert.strictEqual(value, 1000, "Read/write works");
			app.userData.write('highScore', 2000, function() {
				app.userData.read('highScore', function(value) {
					assert.strictEqual(value, 2000, "Read/rewrite works");
					app.userData.remove('highScore', function() {
						app.userData.read('highScore', function(value) {
							assert.strictEqual(value, null, 'Removed works');
							done();
						});
					});
				});
			});
		});
	});
});
