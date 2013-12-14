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

exports.objectify = function(str) { // str is the only required argument
	// set our format hint and callback, if any
	var types = null, callback = null;
	if (arguments[1]) {
		if (typeof arguments[1] === 'string') types = arguments[1];
		else if (typeof arguments[1] === 'function') callback = arguments[1];
	}
	if (arguments[2]) {
		if (typeof arguments[2] === 'function') callback = arguments[2];
		else if (typeof arguments[2] === 'string') types = arguments[2];
	}
	// if it's already an object, just pass it back
	if (typeof str === 'object') {
		if (callback) process.nextTick(function() { callback(null, str); });
		else return str;
		return;
	}
	// otherwise, if it's not a string, it's an error
	else if (typeof str !== 'string') {
		var err = new Error('The supplied value is not a string.');
		if (callback) process.nextTick(function() { callback(err); });
		else return err;
	}
	// trivially handle empty inputs
	if (!str.trim()) {
		if (callback) process.nextTick(function() { callback(null, {}); });
		else return {};
		return;
	}

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
				if (callback) process.nextTick(function() { callback(err); });
				else return err;
				return; // just in case there was a callback
			}
		}
		else typematch = 1; // we don't use typematch in querystring, but we may.
	}

	if (format == 'querystring') {
		// there's no particular error that should be raised by parsing as query string even if it's another format
		// supports querystring, qstring, query
		if (callback) process.nextTick(function() { callback(null, forceobj(qs.parse(str))); });
		else return forceobj(qs.parse(str));
	}
	else if (format == 'json') {
		if (callback) {
			process.nextTick(function() {
				try {
					callback(null, forceobj(JSON.parse(str)));
				}
				catch (e) {
					// we specifically requested json
					if (typematch == 1 && qstring_allowed != 1) callback(new Error('JSON was specified as the string format, but failed to parse correctly'));
					else callback(null, forceobj(qs.parse(str)));
				}
			});
		}
		else {
			try {
				return forceobj(JSON.parse(str));
			}
			catch (e) {
				// we specifically requested json
				if (typematch == 1 && qstring_allowed != 1) return new Error('JSON was specified as the string format, but failed to parse correctly');
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
		if (callback) process.nextTick(function() { callback(err); });
		else return err;
	}
}

exports.stringify = function(obj) { // obj is required
	var format = null, callback = null;
	if (arguments[1]) {
		if (typeof arguments[1] === 'string') format = arguments[1];
		else if (typeof arguments[1] === 'function') callback = arguments[1];
	}
	if (arguments[2]) {
		if (typeof arguments[2] === 'function') callback = arguments[2];
		else if (typeof arguments[2] === 'string') format = arguments[2];
	}
	// default output format
	if (!format) format = 'qstring';
	// if it's already a string, just pass it back
	if (typeof obj === 'string') {
		if (callback) process.nextTick(function() { callback(null, obj); });
		else return obj;
	}
	// otherwise, if it's not an object, it's an error
	else if (typeof obj !== 'object') {
		var err = new Error('The supplied value is not an object.');
		if (callback) process.nextTick(function() { callback(err); });
		else return err;
		return;
	}

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
		if (callback) process.nextTick(function() { callback(err); });
		else return err;
		return; // just in case there was a callback
	}

	if (format == 'querystring') {
		// there's no particular error that should be raised by stringifying as query string
		// supports querystring, qstring, query
		if (callback) process.nextTick(function() { callback(null, qs.stringify(obj)); });
		else return qs.stringify(obj);
	}
	else if (format == 'json') {
		if (callback) process.nextTick(function() { callback(null, JSON.stringify(obj)); });
		else return JSON.stringify(obj);
	}
	else if (format == 'xml') {
		xmlbuilder.options.renderOpts.pretty = false;
		if (callback) process.nextTick(function() { callback(null, xmlbuilder.buildObject(obj)); });
		else return xmlbuilder(obj);
	}
}