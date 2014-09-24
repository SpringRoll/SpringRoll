test('Core', function(assert){

	expect(2);

	var MyClass = {};

	namespace('my.namespace').MyClass = MyClass;

	var includedMyClass = include('my.namespace.MyClass');

	assert.strictEqual(MyClass, my.namespace.MyClass, "namespace() works");
	assert.strictEqual(MyClass, includedMyClass, "include() works");

});

test('Application', function(assert){

	expect(5);

	var Application = include('cloudkid.Application'),
		Loader = include('cloudkid.Loader');

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