// to do: allow passing in options for parsing, e.g. allow explicit root for XML
// to do: stringify
// to do: if data gets large, we'll need to work on asynchronously handling json and qstrings

// we'll need to wrap the functions in requester methods, and only include what we want based on that (i.e. we only want parseString if we include objectify(), only Builder if we include stringify())
var qs = require('qs');
var xml2js = require('xml2js');

var xmlparser = xml2js.parseString;
var xmlbuilder = new xml2js.Builder();

// for our purposes, type is the requested format, format is the detected format
// we only want to test for the bare minimum
var xmlformat = /^\s*<.*>\s*/; // exceptionally dumb xml format recognition
var jsonformat = /^\s*{.*}\s*/; // exceptionally dumb json format recognition

var type_splitter = /\W/; // when we receive a string of formats, split on non-word characters

var supported_types = {
	json: {
		aliases: ['json', 'jsonp'],
		regex: /\bjsonp?\b/i
	},
	xml: {
		aliases: ['xml'],
		regex: /\bxml\b/i
	},
	querystring: {
		aliases: ['querystring', 'qstring', 'query'],
		regex: /\bq((uery(string)?)|(string))\b/i
	}
};

function forceobj(obj) {
	if (obj === '') return {};
	else return obj;
}

function detect(str) {
	if (xmlformat.test(str)) return 'xml';
	else if (jsonformat.test(str)) return 'json';
	else return 'querystring'; // anything can be parsed as a querystring
}

exports.objectify = function(str, types, callback) {
	// if it's not a string, just pass it back
	if (typeof str !== 'string') {
		if (callback) callback(null, str);
		else return str;
		return;
	}
	// trivially handle empty inputs
	if (!str.trim()) {
		if (callback) callback(null, {});
		else return {};
		return;
	}
	if (typeof types === 'function') {
		// flop types and callback, or default types to null
		if (typeof callback === 'string') var typ=callback, callback=types, types=typ;
		else callback=types, types=null;
	}
	if (callback && typeof callback !== 'function') callback = null;

	var format = detect(str);
	var typematch = null; // typematch has no meaning unless we've actually passed in a type
	var qstring_allowed = null; // qstring_allowed has no meaning unless we've actually passed in a type
	if (typeof types === 'string') {
		// if we allow multiple types, including querystrings, errors in parsing another detected type should fall through to querystring
		// also, if we detected another type but we pass in only querystring, we coerce the format to querystring
		if (supported_types.querystring.regex.test(types)) qstring_allowed = 1;
		if (!qstring_allowed || (qstring_allowed && format != 'querystring')) {
			// we only have to do this checking if we don't allow querystrings, or we do but we detected a different format
			if (supported_types[format].regex.test(types)) typematch = 1;
			else if (qstring_allowed) {
				// coerce the format to querystring
				format = 'querystring';
				typematch = 1; // we don't use typematch in querystring, but we may. since we don't know how we might use it in the future, the value here may change
			}
			else {
				typematch = 0; // this is excessive, since we're returning here, but for the sake of clarity
				var err = new Error('The requested data type, ['+types+'], did not match the detected input format: ['+format+']');
				if (callback) callback(err);
				else return err;
				return; // just in case there was a callback
			}
		}
		else typematch = 1; // we don't use typematch in querystring, but we may.
	}

	if (format == 'querystring') {
		// there's no particular error that should be raised by parsing as query string even if it's another format
		// supports querystring, qstring, query
		if (callback) callback(null, forceobj(qs.parse(str)));
		else return forceobj(qs.parse(str));
	}
	else if (format == 'json') {
		try {
			if (callback) callback(null, forceobj(JSON.parse(str)));
			else return forceobj(JSON.parse(str));
		}
		catch (e) {
			if (typematch == 1 && qstring_allowed != 1) {
				// we specifically requested json
				var err = new Error('JSON was specified as the string format, but failed to parse correctly');
				if (callback) callback(err);
				else return err;
			}
			else {
				if (callback) callback(null, forceobj(qs.parse(str)));
				else return forceobj(qs.parse(str));
			}
		}
	}
	else if (format == 'xml') {
		// the expected parameters passed into our callback are the same as returned by the parser, err, result
		if (callback) {
			xmlparser(str, { async: true, explicitRoot: false, explicitArray: false }, function(err, result) {
				if (err) {
					if (typematch == 1 && qstring_allowed != 1) callback(err);
					else callback(null, forceobj(qs.parse(str)));
				}
				else callback(null, forceobj(result));
			});
		}
		else {
			var syncerr = null;
			var syncresult = {};
			xmlparser(str, { async: false, explicitRoot: false, explicitArray: false }, function(err, result) {
				syncresult = forceobj(result);
				if (err) {
					if (typematch == 1 && qstring_allowed != 1) {
						syncerr = err;
					}
					else syncresult = forceobj(qs.parse(str));
				}
			});
			if (syncerr) return syncerr;
			else return syncresult;
		}
	}
	else {
		// this shouldn't be possible, with the way the detect method is written, but handle exceptions here
		var err = new Error('Unknown format match exception.')
		if (callback) callback(err);
		else return err;
	}
}

exports.stringify = function(obj, format, callback) {
	// if it's not an object, just pass it back
	if (typeof obj !== 'object') {
		if (callback) callback(null, obj);
		else return obj;
		return;
	}
	if (typeof format === 'function') {
		// flop format and callback, or default format to querystring
		if (typeof callback === 'string') var frmt=callback, callback=format, format=frmt;
		else callback=format, format='querystring';
	}
	if (callback && typeof callback !== 'function') callback = null;

	var format_match = false;
	for (var type in supported_types) {
		if (format == type) {
			format_match = true;
			break; // it's already in the correct style
		}
		if (supported_types[type].regex.test(format)) {
			format = type; // coerce it into the correct style
			format_match = true;
			break;
		}
	}

	if (!format_match) {
		var err = new Error('The requested string format, ['+format+'], did not match any supported output format');
		if (callback) callback(err);
		else return err;
		return; // just in case there was a callback
	}

	if (format == 'querystring') {
		// there's no particular error that should be raised by stringifying as query string
		// supports querystring, qstring, query
		if (callback) callback(null, qs.stringify(obj));
		else return qs.stringify(obj);
	}
	else if (format == 'json') {
		if (callback) callback(null, JSON.stringify(obj));
		else return JSON.stringify(obj);
	}
	else if (format == 'xml') {
		xmlbuilder.options.renderOpts.pretty = false;
		//xmlbuilder.options.async // we'll need to do something about this
		if (callback) callback(null, xmlbuilder.buildObject(obj));
		else return xmlbuilder(obj);
	}
}