test('Language', function(assert){

	//expect(5);

	var Application = springroll.Application;

	// New Application
	var app = new Application();

	//new Language
	var config = {
		default:"en",
		languages:
		[
			"en",
			"es",
			"en-gb"
		]
	};

	// String table data
	var stringTable = {
		myKey:"This is a string",
		myFormattingKey:"This is a %s string"
	};

	app.translating.setConfig(config);

	app.translating.setLanguage("jp");
	assert.equal(app.translating.current, "en", "Fallback to default works");

	app.translating.setLanguage(["jp", "en-gb"]);
	assert.equal(app.translating.current, "en-gb", "Setting in preferential order works");

	app.translating.setLanguage("es-mx");
	assert.equal(app.translating.current, "es", "Fallback to general locale works");
	
	var url = app.loader.cacheManager.prepare("http://www.springroll.io/%LANG%/stuff.json");
	assert.equal(url, "http://www.springroll.io/es/stuff.json", "Url modification works");
	
	app.translating.setStringTable(stringTable);
	assert.equal(app.translating.getString("myKey"), stringTable.myKey, "String table works");
	assert.equal(app.translating.getFormattedString("myFormattingKey", "formatted"), "This is a formatted string", "String table works");

	// Tests cleanup
	app.destroy();
	assert.ok(!app.translating, 'Language object was destroyed');
});