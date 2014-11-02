test('namespace & include', function(assert){
	
	expect(2);

	var MyClass = {};

	namespace('my.namespace').MyClass = MyClass;

	var includedMyClass = include('my.namespace.MyClass');

	assert.strictEqual(MyClass, my.namespace.MyClass, "namespace() works");
	assert.strictEqual(MyClass, includedMyClass, "include() works");

	delete my;
});

test('Application', function(assert){

	expect(5);

	var Application = springroll.Application,
		Loader = springroll.Loader;

	// New Application
	var app = new Application();
	assert.strictEqual(app, Application.instance, "Application's singleton works");
	assert.ok(Loader.instance, "Loader was created");

	// Tests cleanup
	app.destroy();
	assert.ok(app._destroyed, '_destroyed worked');
	assert.ok(!Application.instance, 'Singleton was destroyed');
	assert.ok(!Loader.instance, "Loader was destroyed");
});

test('Loader', function(assert){

	//expect(9);

	var Application = springroll.Application,
		Loader = springroll.Loader;

	// New Application
	var basePath = "http://example.com/";
	var app = new Application({
		cacheBust: true,
		basePath: basePath
	});

	var loader = Loader.instance;
	var url = "test.jpg";
	var cbUrl = loader.cacheManager.prepare(url);
	var basePathUrl = loader.cacheManager.prepare(url, true);

	assert.ok(/^test\.jpg\?cb\=[0-9]+$/.test(cbUrl), "Cache Busting works");
	assert.equal(basePathUrl.indexOf(basePath + url), 0, "Found base path");

	// Turn off cache busting and base path
	app.options.cacheBust = false;
	app.options.basePath = '';

	loader.load('data/nothing.txt', function(){});
	assert.ok(loader.cancel('data/nothing.txt'), "Canceling load");

	stop();
	// Test loading a basic file
	url = 'data/file.txt';
	loader.load(url, function(result){
		start();
		assert.strictEqual(result.content, "info", "Loaded plain text file");
		assert.strictEqual(result.url, url, 'Result url is the same');
		stop();
		
		loader.load('data/file.json', function(result){
			start();
			assert.ok(typeof result.content == "object", "JSON parsed return");
			assert.strictEqual(result.content.example, 1, "JSON content return");
			stop();

			loader.load('data/image.png', function(result){
				start();
				assert.equal(result.content.nodeName, "IMG", "DOM image element loaded");
				assert.equal(result.content.width, 15, "DOM image element width");
			});
		});
	});
});