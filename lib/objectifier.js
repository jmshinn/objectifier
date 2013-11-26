// to do: allow passing in options for parsing, e.g. allow explicit root for XML
// to do: stringify
// to do: if data gets large, we'll need to work on asynchronously handling json and qstrings

var qs = require('qs');
var xmlparser = require('xml2js').parseString;

var xmlformat = /^\s*<.*>\s*/; // exceptionally dumb xml format recognition
var jsonformat = /^\s*{.*}\s*/; // exceptionally dumb json format recognition

var format_splitter = /[^a-zA-Z0-9]/; // when we receive a string of formats, split on non-character characters

var supported_formats = {
	json: {
		aliases: ['json', 'jsonp'],
		regex: /jsonp?/i
	},
	xml: {
		aliases: ['xml'],
		regex: /xml/i
	},
	querystring: {
		aliases: ['querystring', 'qstring', 'query'],
		regex: /q((uery(string)?)|(string))/i
	}
};

function forceobj(obj) {
	if (obj === '') return {};
	else return obj;
}

function detect(str) {
	var formats = null;
	if (arguments[1]) formats = arguments[1];

	if 
}

exports.objectify = function(str, format, callback) {
	if (typeof format == 'function') {
		callback = format;
		format = null;
	}
	if (callback && typeof callback != 'function') callback = null;
	var formats = [];
	if (typeof format == 'string') {
		var input_formats = format.split(format_splitter);
		for (var i=0; i<input_formats.length; i++) {
			for (var frmt in supported_formats) {
				if (supported_formats[frmt].regex.test(formats[i])) {
					formats.push(frmt);
					break;
				}
			}
		}
	}





		// there's no particular error that should be raised by parsing as query string even if it's another format
		// supports querystring, qstring, query
		if (format.match(/^\s*q((uery(string)?)|(string))\s*$/i)) {
			if (callback) callback(null, forceobj(qs.parse(str)));
			else return forceobj(qs.parse(str));
		}
		else if (format.match(/^\s*json\s*$/i)) {
			try {
				if (callback) callback(null, forceobj(JSON.parse(str)));
				else return forceobj(JSON.parse(str));
			}
			catch (e) {
				if (callback) callback(new Error('JSON was specified as the string format, but failed to parse correctly'));
				else return new Error('JSON was specified as the string format, but failed to parse correctly');
			}
		}
		else if (format.match(/^\s*xml\s*$/i)) {
			// the expected parameters passed into our callback are the same as returned by the parser, err, result
			if (callback) xmlparser(str, { async: true, explicitRoot: false }, function(err, result) { callback(err, forceobj(result)); });
			else {
				var syncerr = null;
				var syncresult = {};
				xmlparser(str, { async: false, explicitRoot: false }, function(err, result) {
					syncerr = err;
					syncresult = forceobj(result);
				});
				if (syncerr) return syncerr;
				else return syncresult;
			}
		}
		else {
		}
	}
	else {
		// detect the string format
		if (xmlformat.test(str)) {
			// if it matches our dumb xml format, but it fails to parse, try querystring parsing on it instead, it's definitely not json
			if (callback) {
				xmlparser(str, { async: true, explicitRoot: false }, function (err, result) {
					if (err) callback(null, forceobj(qs.parse(str)));
					else callback(null, forceobj(result));
				});
			}
			else {
				var syncresult = {};
				xmlparser(str, { async: false, explicitRoot: false }, function(err, result) {
					if (err) syncresult = forceobj(qs.parse(str));
					else syncresult = forceobj(result);
				});
				return syncresult;
			}
		}
		else if (jsonformat.test(str)) {
			// if it matches our dumb json format, but it fails to parse, try querystring parsing on it instead, it's definitely not xml
			try {
				if (callback) callback(null, forceobj(JSON.parse(str)));
				else return forceobj(JSON.parse(str));
			}
			catch (e) {
				if (callback) callback(null, forceobj(qs.parse(str)));
				else return forceobj(qs.parse(str));
			}
		}
		else {
			// if it doesn't match our xml or json formats, then the only thing we have left to try is querystring, and there's not much that can really go wrong with it
			if (callback) callback(null, forceobj(qs.parse(str)));
			else return forceobj(qs.parse(str));
		}
	}
}

exports.stringify = function(obj, format, callback) {
}