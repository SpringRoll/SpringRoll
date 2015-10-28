test('Language', function(assert)
{

	//expect(5);

	var Application = springroll.Application;

	// New Application
	var app = new Application();

	//new Language
	var config = {
		default: "en",
		languages: [
			"en",
			"es",
			"en-gb"
		]
	};

	// String table data
	var stringTable = {
		myKey: "This is a string",
		myFormattingKey: "This is a %s string"
	};

	app.languages.setConfig(config);

	app.languages.setLanguage("jp");
	assert.equal(app.languages.current, "en", "Fallback to default works");

	app.languages.setLanguage(["jp", "en-gb"]);
	assert.equal(app.languages.current, "en-gb", "Setting in preferential order works");

	app.languages.setLanguage("es-mx");
	assert.equal(app.languages.current, "es", "Fallback to general locale works");

	var url = app.loader.cacheManager.prepare("http://www.springroll.io/%LANG%/stuff.json");
	assert.equal(url, "http://www.springroll.io/es/stuff.json", "Url modification works");

	app.languages.setStringTable(stringTable);
	assert.equal(app.languages.getString("myKey"), stringTable.myKey, "String table works");
	assert.equal(app.languages.getFormattedString("myFormattingKey", "formatted"), "This is a formatted string", "String table works");

	// Tests cleanup
	app.destroy();
	assert.ok(!app.languages, 'Language object was destroyed');
});