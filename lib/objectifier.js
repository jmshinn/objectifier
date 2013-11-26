// to do: allow passing in options for parsing, e.g. allow explicit root for XML
// to do: stringify
// to do: if data gets large, we'll need to work on asynchronously handling json and qstrings

var qs = require('qs');
var xmlparser = require('xml2js').parseString;

function forceobj(obj) {
	if (obj === '') return {};
	else return obj;
}

exports.objectify = function(str, type, callback) {
	if (typeof type == 'function') {
		callback = type;
		type = null;
	}
	if (callback && typeof callback != 'function') callback = null;
	if (typeof type == 'string') {
		// there's no particular error that should be raised by parsing as query string even if it's another type
		// supports querystring, qstring, query
		if (type.match(/^\s*q((uery(string)?)|(string))\s*$/i)) {
			if (callback) callback(null, forceobj(qs.parse(str)));
			else return forceobj(qs.parse(str));
		}
		else if (type.match(/^\s*json\s*$/i)) {
			try {
				if (callback) callback(null, forceobj(JSON.parse(str)));
				else return forceobj(JSON.parse(str));
			}
			catch (e) {
				if (callback) callback(new Error('JSON was specified as the string format, but failed to parse correctly'));
				else return new Error('JSON was specified as the string format, but failed to parse correctly');
			}
		}
		else if (type.match(/^\s*xml\s*$/i)) {
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
	}
	else {
		// detect the string format
		var xmlformat = /^\s*<.*>\s*/; // exceptionally dumb xml format recognition
		var jsonformat = /^\s*{.*}\s*/; // exceptionally dumb json format recognition
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

exports.stringify = function(obj, type, callback) {
}