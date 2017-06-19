(function(Number, Object)
{
    /**
     * Add methods to Number
     * @class Number
     */

    /**
     * Returns a string of the number as an integer with leading zeros to fill the string out
     * to a certain number of digits.
     * @method toPaddedString
     * @param {Number} [totalDigits=2] The total number of digits to be displayed.
     * @return {String} The number string.
     */
    if (!Number.prototype.toPaddedString)
    {
        Object.defineProperty(Number.prototype, 'toPaddedString',
        {
            enumerable: false,
            writable: false,
            value: function(totalDigits)
            {
                if (!totalDigits)
                    totalDigits = 2;
                var num = this;
                var leader;
                if (num < 0)
                {
                    num *= -1;
                    leader = "-";
                }
                var s = String(Math.floor(num));
                while (s.length < totalDigits)
                    s = "0" + s;
                if (leader)
                    s = leader + s;
                return s;
            }
        });
    }

}(Number, Object));