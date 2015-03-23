/*jshint node:true*/

var
    moment = require('moment'),
    formats;

formats = {
    'date': function (value) {
    	var
    		out = null;

        if ( !(/^[0-9]{4,}-[0-9]{2}-[0-9]{2}$/.test(value) && moment(value, 'YYYY-MM-DD').isValid()) ) {

            out = 'A valid date in YYYY-MM-DD format expected';
        }

        return out;

    },
    'date-time': function (value) {
    	var
    		out = null;

    	if (
            /* jshint maxlen: 130 */
            !(/[0-9]{4,}-[0-9]{2}-[0-9]{2}\s[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+|)(?:[+-][0-9]{2}:[0-9]{2}|Z)/.test(value) &&
            moment(value).isValid())
        ) {

            out = 'A valid RFC 3999 date-time string expected';
        }

        return out;
    }
};

module.exports = formats;
