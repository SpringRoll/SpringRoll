test('namespace & include', function(assert){
	
	expect(2);

	var MyClass = {};

	namespace('my.namespace').MyClass = MyClass;

	var includedMyClass = include('my.namespace.MyClass');

	assert.strictEqual(MyClass, my.namespace.MyClass, "namespace() works");
	assert.strictEqual(MyClass, includedMyClass, "include() works");
});

test('Application', function(assert){

	expect(5);

	var Application = cloudkid.Application,
		Loader = cloudkid.Loader;

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

	expect(2);

	var Application = cloudkid.Application,
		Loader = cloudkid.Loader;

	// New Application
	var basePath = "http://example.com/";
	var app = new Application({
		cacheBust: true,
		basePath: basePath
	});

	var url = "test.jpg";
	var cbUrl = Loader.instance.cacheManager.prepare(url);
	var basePathUrl = Loader.instance.cacheManager.prepare(url, true);

	assert.ok(/^test\.jpg\?cb\=[0-9]+$/.test(cbUrl), "Cache Busting works");
	assert.equal(basePathUrl.indexOf(basePath + url), 0, "Found base path");

	app.destroy();
});