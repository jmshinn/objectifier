//var d = require('domain').create();

var qs = require('qs');
var xmlparser = require('xml2js').parseString;

exports.objectify = function(str, type, callback) {
	if (typeof type == 'function') {
		callback = type;
		type = null;
	}
	else if typeof type == 'string') {
		// there's no particular error that should be raised by parsing as query string even if it's another type
		if (type.match(/^\s*query(string)?\s*$/i)) callback(null, qs.parse(str));
		else if (type.match(/^\s*json\s*$/i)) {
			try {
				callback(null, JSON.parse(str));
			}
			catch (e) {
				callback(new Error('JSON was specified as the string format, but failed to parse correctly'));
			}
		}
		else if (type.match(/^\s*xml\s*$/i)) {
			// the expected parameters passed into our callback are the same as returned by the parser, err, result
			xmlparser(str, { async: true }, callback);
		}
	}
	else {
		// xml parsing has the most
		var xmlformat = /^\s*<.*>\s*/; // exceptionally dumb xml format recognition
		var jsonformat = /^\s*{.*}\s*/; // exceptionall dumb json format recognition
		if (xmlformat.test(str)) {
			// if it matches our dumb xml format, but it fails to parse, try querystring parsing on it instead, it's definitely not json
			xmlparser(str, { async: true }, function (err, result) {
				if (err) callback(null, qs.parse(str));
				else callback(null, result);
			});
		}
		else if (jsonformat.test(str)) {
			// if it matches our dumb json format, but it fails to parse, try querystring parsing on it instead, it's definitely not xml
			try {
				callback(null, JSON.parse(str));
			}
			catch (e) {
				callback(null, qs.parse(str));
			}
		}
		else {
			// if it doesn't match our xml or json formats, then the only thing we have left to try is querystring, and there's not much that can really go wrong with it
			callback(null, qs.parse(str));
		}
}

exports.stringify = function(obj, type, callback) {
}