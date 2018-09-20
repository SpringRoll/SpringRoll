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

QUnit.module('UserData');
test('existence', function(assert)
{
	assert.ok(!!app.userData, 'Application userData property');
});

test('write', function(assert)
{
	var done = assert.async();

	app.container.supported = false;

	app.userData.write('highScore', 1000, function()
	{
		app.userData.read('highScore', function(value)
		{
			assert.strictEqual(value, 1000, "Read/write works");
			done();
		});
	});
});

test('remove', function(assert)
{
	var done = assert.async();

	app.container.supported = false;

	app.userData.write('highScore', 1000, function()
	{
		app.userData.remove('highScore', function()
		{
			app.userData.read('highScore', function(value)
			{
				assert.strictEqual(value, null, "remove works correctly");
				done();
			});
		});
	});
});