var Application = include('springroll.Application');
var app = new Application();

test('Asset Manager', function(assert)
{
	expect(4);
	assert.ok(!!app.assetManager, "Asset Manager exists");
	assert.ok(!!app.load, "Application load");
	assert.ok(!!app.unload, "Application unload");
	assert.ok(!!app.cache, "Application cache");
});

test('Single Asset', function(assert)
{
	expect(6);
	var src = "data/file.txt";

	stop();
	app.load(src, function(txt)
	{
		start();
		assert.ok(typeof txt == "string", "Result is object");

		stop();
		var objectCallback = function(txt2, asset, assets)
		{
			start();
			assert.equal(txt, txt2, "Object-based loading");
			assert.ok(Object.isPlain(asset), "Asset is plain object");
			assert.ok(Array.isArray(assets), "Assets is available");
			assert.strictEqual(objectCallback, asset.complete, "Asset object check");

			stop();
			assets.push({
				src: "data/config.json",
				complete: function(config)
				{
					start();
					assert.ok(!!config, "Created sub-load");
				}
			})
		};
		app.load({
			src: src,
			complete: objectCallback
		})
	});
});

test('List Assets', function(assert)
{
	expect(5);
	var assets = [
		'data/config.json',
		'data/image.png',
		function(done)
		{
			done(100);
		}
	];
	stop();
	app.load(assets, {
		startAll: false,
		complete: function(results)
		{
			start();
			assert.ok(Array.isArray(results), "Results is a list");
			assert.equal(results.length, assets.length, "Length matches assets");
			assert.equal(typeof results[0], "object", "JSON loaded");
			assert.equal(results[1].tagName, "IMG", "Image loaded");
			assert.equal(results[2], 100, "Asynchronous loaded");
		}
	});
});


test('Mapped Assets', function(assert)
{
	expect(5);
	var assets = [
		{
			src: 'data/config.json',
			id: 'config'
		},
		{
			src: 'data/image.png',
			id: 'image'
		},
		{
			assets: [
				'data/file.txt',
				'data/captions.json'
			],
			id: 'files'
		}
	];
	stop();
	app.load(assets, function(results)
	{
		start();
		assert.ok(!!results, "Results is returned");
		assert.ok(Object.isPlain(results), "Results is a map");
		assert.equal(results.image.tagName, "IMG", "Mapped Image Loaded");
		assert.ok(Object.isPlain(results.config), "Mapped JSON Loaded");
		assert.ok(Array.isArray(results.files), "Asset list loaded");
	});
});

test('Cached Assets', function(assert)
{
	expect(3);
	var assets = [
		{
			src: 'data/file.json',
			id: '_FILE_'
		},
		{
			src: 'data/config.json',
			cache: false
		},
		'data/image.png'
	];
	stop();
	app.load(assets, {
		complete: function(results)
		{
			start();
			assert.ok(!!app.cache('image'), "Cache Image is returned");
			assert.ok(!app.cache('config'), "Override cache all");
			assert.ok(!!app.cache('_FILE_'), "Custom ID specified");
		},
		cacheAll: true
	});
});


test('Color-Alpha Task', function(assert)
{
	expect(2);
	stop();
	var asset = {
		color: 'data/image.png',
		alpha: 'data/image-alpha.png'
	};
	app.load(asset, function(image)
	{
		start();
		assert.ok(!!image, "Color-alpha asset is loaded");
		assert.equal(image.tagName, "CANVAS", "Color-alpha is canvas");
	});
});