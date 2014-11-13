test('Language', function(assert){

	//expect(5);

	var Application = springroll.Application,
		Loader = springroll.Loader,
		Language = springroll.Language;

	// New Application
	var app = new Application();
	//new Language
	var config =
	{
		default:"en",
		languages:
		[
			"en",
			"es",
			"en-gb"
		]
	};
	var language = new Language(config);
	assert.strictEqual(language, Language.instance, "Language's singleton works");
	assert.ok(Loader.instance, "Language was created");
	language.setLanguage("jp");
	assert.equal(language.current, "en", "Fallback to default works");
	language.setLanguage(["jp", "en-gb"]);
	assert.equal(language.current, "en-gb", "Setting in preferential order works");
	language.setLanguage("es-mx");
	assert.equal(language.current, "es", "Fallback to general locale works");
	
	var url = Loader.instance.cacheManager.prepare("http://www.springroll.io/%LANG%/stuff.json");
	assert.equal(url, "http://www.springroll.io/es/stuff.json", "Url modification works");
	
	var stringTable =
	{
		myKey:"This is a string",
		myFormattingKey:"This is a %s string"
	};
	language.setStringTable(stringTable);
	assert.equal(language.getString("myKey"), stringTable.myKey, "String table works");
	assert.equal(language.getFormattedString("myFormattingKey", "formatted"), "This is a formatted string", "String table works");

	// Tests cleanup
	language.destroy();
	assert.ok(!Language.instance, 'Singleton was destroyed');
});