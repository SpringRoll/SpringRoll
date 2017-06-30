const {Enum} = springroll;

describe('springroll.Enum', function() {

    it('should create simple Enum', function() {
        const e = new Enum(
            'valueOf0',
            'valueOf1',
            'valueOf2'
        );
        assert.ok(e.valueOf0, 'EnumValue was created.');
        assert.notEqual(e.valueOf0, 0, 'EnumValues are not integers.');
        assert.equal(e.valueOf2.asInt, 2, 'EnumValue.asInt is correct.');

        //test to make sure we only enumrate the EnumValues
        let count = 0;

        // eslint-disable-next-line no-unused-vars
        for (let v in e) {
            count++;
        }
        assert.equal(count, 3, 'Enum\'s only enumerable properties are EnumValues.');
    });

    it('should create complex Enum', function() {
        const e = new Enum(
            {
                name: 'one',
                value: '1',
                toString: 'I am the One!'
            },
            'two',
            {
                name: 'screwSequentialNumbers',
                value: 42
            },
            {
                name: 'duplicateValue',
                value: 42
            });
        
        assert.ok(e.duplicateValue, 'Duplicate value was created properly.');
        assert.equal(e.screwSequentialNumbers, e.valueFromInt(42),
            'Enum.valueFromInt() returns the correct value, even when nonsequential and duplicate.');
        assert.equal(e.one.toString(), 'I am the One!', 'toString() override works.');
    });

});