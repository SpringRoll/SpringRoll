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

	app.language.setConfig(config);

	app.language.setLanguage("jp");
	assert.equal(app.language.current, "en", "Fallback to default works");

	app.language.setLanguage(["jp", "en-gb"]);
	assert.equal(app.language.current, "en-gb", "Setting in preferential order works");

	app.language.setLanguage("es-mx");
	assert.equal(app.language.current, "es", "Fallback to general locale works");
	
	var url = app.loader.cacheManager.prepare("http://www.springroll.io/%LANG%/stuff.json");
	assert.equal(url, "http://www.springroll.io/es/stuff.json", "Url modification works");
	
	app.language.setStringTable(stringTable);
	assert.equal(app.language.getString("myKey"), stringTable.myKey, "String table works");
	assert.equal(app.language.getFormattedString("myFormattingKey", "formatted"), "This is a formatted string", "String table works");

	// Tests cleanup
	app.destroy();
	assert.ok(!app.language, 'Language object was destroyed');
});