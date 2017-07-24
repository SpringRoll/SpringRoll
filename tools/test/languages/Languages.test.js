const {Languages, Loader, Application} = springroll;

describe('springroll.Languages', function() {

    before(function(done) {
        this.app = new Application({ name: 'test' });
        this.app.on('ready', () => {
            this.languages = this.app.languages;
            done();
        });
    });

    after(function() {
        this.languages = null;
        this.app.destroy();
        this.app = null;
    });

    it('should set configuration', function() {
        this.languages.setConfig({
            default: 'en',
            languages: [
                'en',
                'es',
                'en-gb'
            ]
        });
    });

    it('should set the language', function() {
        this.languages.setLanguage('jp');
        assert.equal(this.languages.current, 'en', 'Fallback to default works');
    });
    
    it('should set the language in preferential order', function() {
        this.languages.setLanguage(['jp', 'en-gb']);
        assert.equal(this.languages.current, 'en-gb', 'Setting in preferential order works');
    });

    it('should fallback to locale', function() {
        this.languages.setLanguage('es-mx');
        assert.equal(this.languages.current, 'es', 'Fallback to general locale works');
    });

    it('should sub with string table', function() {
        const stringTable = {
            myKey: 'This is a string',
            myFormattingKey: 'This is a %s string'
        };
        this.languages.setStringTable(stringTable);
        assert.equal(this.languages.getString('myKey'), stringTable.myKey, 'String table works');
        assert.equal(this.languages.getFormattedString('myFormattingKey', 'formatted'), 'This is a formatted string', 'String table works');
    });

});