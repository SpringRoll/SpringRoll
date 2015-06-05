test('namespace & include', function(assert){
	
	expect(2);

	var MyClass = {};

	namespace('my.namespace').MyClass = MyClass;

	var includedMyClass = include('my.namespace.MyClass');

	assert.strictEqual(MyClass, my.namespace.MyClass, "namespace() works");
	assert.strictEqual(MyClass, includedMyClass, "include() works");

	delete window.my;
});

test('Enum', function(assert){

	expect(8);

	var Enum = include('springroll.Enum');
	
	var myEnum = new Enum("valueOf0",
						"valueOf1",
						"valueOf2");
	var myOtherEnum = new Enum({name: "one", value:"1", toString:"I am the One!"},
								"two",
								{name:"screwSequentialNumbers", value:42},
								{name:"duplicateValue", value:42});
	assert.ok(myEnum.valueOf0, "EnumValue was created.");
	assert.notEqual(myEnum.valueOf0, 0, "EnumValues are not integers.");
	assert.notEqual(myEnum.valueOf1, myOtherEnum.one, "EnumValues with the same integer value are not the same.");
	assert.equal(myEnum.valueOf2.asInt, 2, "EnumValue.asInt is correct.");
	assert.ok(myOtherEnum.duplicateValue, "Duplicate value was created properly.");
	assert.equal(myOtherEnum.screwSequentialNumbers, myOtherEnum.valueFromInt(42),
				"Enum.valueFromInt() returns the correct value, even when nonsequential and duplicate.");
	assert.equal(myOtherEnum.one.toString(), "I am the One!", "toString() override works.");
	//test to make sure we only enumrate the EnumValues
	var count = 0;
	for (var enumVal in myEnum) {
		count++;
	}
	assert.equal(count, 3, "Enum's only enumerable properties are EnumValues.");
});

test('Application', function(assert){

	expect(5);

	var Application = include('springroll.Application');

	// New Application
	var app = new Application();
	assert.strictEqual(app, Application.instance, "Application's singleton works");
	assert.ok(app.loader, "Loader was created");

	// Tests cleanup
	app.destroy();
	assert.ok(app.destroyed, 'Destroyed worked');
	assert.ok(!Application.instance, 'Singleton was destroyed');
	assert.ok(!app.loader, "Loader was destroyed");
});

test('Loader', function(assert){

	//expect(9);
	var Application = include('springroll.Application');

	// New Application
	var basePath = "http://example.com/";
	var app = new Application({
		cacheBust: true,
		basePath: basePath
	});
	var loader = app.loader;
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