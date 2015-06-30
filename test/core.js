test('namespace & include', function(assert){
	
	expect(2);

	var MyClass = {};

	namespace('my.namespace').MyClass = MyClass;

	var includedMyClass = include('my.namespace.MyClass');

	assert.strictEqual(MyClass, my.namespace.MyClass, "namespace() works");
	assert.strictEqual(MyClass, includedMyClass, "include() works");

	delete window.my;
});

test('mixin', function(assert){
	
	var instance = {};
	var MyClass = function(value)
	{
		this.value = value;
	};
	var p = MyClass.prototype;

	// Method to add to the object instance
	p.test = function()
	{
		return true;
	};

	// Add a getter or setter with enumerable
	Object.defineProperty(p, "enabled", {
		enumerable: true,
		get: function()
		{
			return true;
		}
	});

	// We want this to fail, no enumerable property
	Object.defineProperty(p, "active", {
		get: function()
		{
			return true;
		}
	});

	// do the mixin
	mixin(instance, MyClass, 100);

	assert.strictEqual(instance.value, 100, "Constructor arguments");
	assert.ok(instance.test, "Instance includes prototype method");
	assert.strictEqual(instance.test(), true, "function mixin works");
	assert.notOk(instance.active, "Non-enumerable getter doesn't work");
	assert.strictEqual(instance.enabled, true, "getter works");
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

test('Math', function(assert){
	expect(11);

	assert.strictEqual(10, Math.clamp(20,2,10), "Upper clamp");
	assert.strictEqual(2, Math.clamp(-1,2,10), "Lower clamp");
	assert.strictEqual(0, Math.clamp(-1,10), "Zero-based clamp");
	assert.strictEqual(4, Math.dist({x:0,y:4}, {x:0,y:0}), "2 Point distance");
	assert.strictEqual(4, Math.dist(0,4,0,0), "X, Y, X1, Y1 distance");

	var i = Math.randomInt(4, 10);
	assert.ok(i >= 4, "Random Int Min");
	assert.ok(i <= 10, "Random Int Max");
	assert.equal(parseInt(i), i, "Is Int");

	i = Math.randomInt(100);
	assert.ok(i >= 0, "Zero-based Random Int Min");
	assert.ok(i <= 100, "Zero-based Random Int Max");
	assert.equal(parseInt(i), i, "Zero-based Is Int");
});

test('Array', function(assert){
	expect(6);
	var arr = [1, 2, 3];
	assert.strictEqual(3, arr.last(), "Last property");
	assert.ok(arr.indexOf(arr.random()) > -1, "Random item");
	arr.shuffle();
	assert.strictEqual(arr.length, 3, "Array length after shuffle");
	assert.ok(arr.indexOf(1) > -1, "First item index");
	assert.ok(arr.indexOf(2) > -1, "Second item index");
	assert.ok(arr.indexOf(3) > -1, "Third item index");
});

test('String', function(assert){
	expect(2);
	var str = "Test String";
	assert.strictEqual(str.reverse(), "gnirtS tseT", "String reverse");
	str = "My name is %s!";
	var sub = "John";
	var result = "My name is John!";
	assert.strictEqual(str.format("John"), result, "String formatting");
});

test('Object', function(assert){
	expect(13);

	var obj1 = { id : 'foo', name : 'Hello!', value : 100 };
	var obj2 = { id : 'bar', value : 200 };
	var result = Object.merge(obj1, obj2);
	assert.strictEqual(result.id, 'bar', "Override existing property id");
	assert.strictEqual(result.value, 200, "Override existing property value");
	assert.strictEqual(result.name, 'Hello!', "Base property");

	var resultCopy = result.clone();
	assert.notStrictEqual(resultCopy, result, "Clone object");
	assert.strictEqual(result.id, resultCopy.id, "Cloned property id");
	assert.strictEqual(result.value, resultCopy.value, "Cloned property value");
	assert.strictEqual(result.name, resultCopy.name, "Cloned property name");

	assert.ok(Object.isPlain({}), "Empty is plain object");
	assert.ok(Object.isPlain({value:{}}), "Nested is plain object");
	assert.ok(Object.isPlain(result), "Result is plain object");
	assert.notOk(Object.isPlain(function(){}), "New function is not plain object");
	assert.notOk(Object.isPlain(window), "Window is not a plain object");
	
	assert.ok(Object.merge(null, {}), "Object.merge handles null targets");
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