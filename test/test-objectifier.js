var objectify = require('../lib/objectifier').objectify;
var stringify = require('../lib/objectifier').stringify;

exports.JSON = {
	test0: function (test) {
		test.expect(4);
		var as = 0;
		objectify('', 'json', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {}, 'Explicit JSON, trivially handle empty string');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test1: function (test) {
		test.expect(4);
		var as = 0;
		objectify('{}', 'json', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {}, 'Explicit JSON, empty object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test2: function (test) {
		test.expect(4);
		var as = 0;
		objectify('{"key": "val"}', 'JSON', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {key: 'val'}, 'Explicit JSON, non-empty object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test3: function (test) {
		test.expect(4);
		var as = 0;
		objectify('key=val&foo=bar', ' json ', function(err, result) {
			test.equal(++as, 2, 'Async B');
			var testerr = new Error('error');
			test.deepEqual(err, testerr, 'Explicit JSON, malformed string error');
			test.equal(result, null, 'Explicit JSON, malformed string result');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test4: function (test) {
		test.expect(4);
		var as = 0;
		objectify('{}', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {}, 'Sensed JSON, empty object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test5: function (test) {
		test.expect(4);
		var as = 0;
		objectify('{"key": "val"}', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {key: 'val'}, 'Sensed JSON, non-empty object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test6: function (test) {
		test.expect(4);
		var as = 0;
		objectify('{key=val&foo=bar}', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {'{key': 'val', 'foo': 'bar}'}, 'Sensed JSON, malformed string fallthru to querystring');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test7: function (test) {
		var result = objectify('{"key": "val", "foo": "bar"}');
		var testerr = new Error('error');
		test.expect(2);
		test.notEqual(result, testerr);
		test.deepEqual(result, {key: 'val', foo: 'bar'}, 'Synchronous JSON, non-empty object');
		test.done();
	},
	test8: function (test) {
		test.expect(4);
		var as = 0;
		objectify('{"key": "val", "foo": "bar"}', 'xml qstring', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {'{"key": "val", "foo": "bar"}': ''}, 'Sensed JSON, JSON not allowed but querystring is, fallthru to querystring');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test9: function (test) {
		test.expect(4);
		var as = 0;
		objectify('{"key": "val", "foo": "bar"}', 'xml, json', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {'key': 'val', 'foo': 'bar'}, 'Sensed JSON, JSON allowed');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	}
};

exports.XML = {
	test0: function (test) {
		test.expect(4);
		var as = 0;
		objectify('', 'xml', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {}, 'Explicit XML, trivially handle empty string');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test1: function (test) {
		test.expect(4);
		var as = 0;
		objectify('<root></root>', 'xml', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {}, 'Explicit XML, empty object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test2: function (test) {
		test.expect(4);
		var as = 0;
		objectify('<root><key>val</key></root>', 'XML', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {key: 'val'}, 'Explicit XML, non-empty object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test3: function (test) {
		test.expect(4);
		var as = 0;
		objectify('<root><key foo="bar">val</key></root>', ' xml ', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {key: {$: {foo: 'bar'}, _: 'val'}}, 'Explicit XML, non-empty object with attributes');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test4: function (test) {
		test.expect(4);
		var as = 0;
		objectify('key=val&foo-bar', ' xml', function(err, result) {
			test.equal(++as, 2, 'Async B');
			var testerr = new Error('error');
			test.deepEqual(err, testerr, 'Explicit XML, malformed string error');
			test.equal(result, null, 'Explicit XML, malformed string result');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test5: function (test) {
		test.expect(4);
		var as = 0;
		objectify('<root></root>', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {}, 'Sensed XML, empty object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test6: function (test) {
		test.expect(4);
		var as = 0;
		objectify('<root><key>val</key></root>', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {key: 'val'}, 'Sensed XML, non-empty object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test7: function (test) {
		test.expect(4);
		var as = 0;
		objectify('<root><key foo="bar">val</key></root>', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {key: {$: {foo: 'bar'}, _: 'val'}}, 'Sensed XML, non-empty object with attributes');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test8: function (test) {
		test.expect(4);
		var as = 0;
		objectify('<key=val&foo=bar>', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {'<key': 'val', 'foo': 'bar>'}, 'Sensed XML, malformed string fallthru to querystring');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test9: function (test) {
		var result = objectify('<root><key foo="bar">val</key></root>');
		var testerr = new Error('error');
		test.expect(2);
		test.notEqual(result, testerr);
		test.deepEqual(result, {key: {$: {foo: 'bar'}, _: 'val'}}, 'Synchronous XML, non-empty object with attributes');
		test.done();
	},
	test10: function (test) {
		test.expect(4);
		var as = 0;
		objectify('<root><key foo="bar">val</key></root>', 'json qstring', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {'<root><key foo': '"bar">val</key></root>'}, 'Sensed XML, XML not allowed but querystring is, fallthru to querystring');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test11: function (test) {
		test.expect(4);
		var as = 0;
		objectify('<root><key foo="bar">val</key></root>', 'json, xml', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {key: {$: {foo: 'bar'}, _: 'val'}}, 'Sensed XML, XML allowed');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	}
}

exports.qstring = {
	test0: function (test) {
		test.expect(4);
		var as = 0;
		objectify('', 'query', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {}, 'Explicit Qstring, trivially handle empty string');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test1: function (test) {
		test.expect(4);
		var as = 0;
		objectify('', 'query', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {}, 'Explicit Qstring, empty object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test2: function (test) {
		test.expect(4);
		var as = 0;
		objectify('key=val&foo=bar', 'querystring', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {key: 'val', foo: 'bar'}, 'Explicit Qstring, non-empty object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test3: function (test) {
		test.expect(4);
		var as = 0;
		objectify('blah', 'qstring', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {blah: ''}, 'Explicit Qstring, only key');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test4: function (test) {
		test.expect(4);
		var as = 0;
		objectify('{"key": "val"}', 'query', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {'{"key": "val"}': ''}, 'Explicit Qstring, passed in JSON format');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test5: function (test) {
		test.expect(4);
		var as = 0;
		objectify('<root><key foo="bar">val</key></root>', 'qstring', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {'<root><key foo': '"bar">val</key></root>'}, 'Explicit Qstring, passed in XML format');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test6: function (test) {
		test.expect(4);
		var as = 0;
		objectify('key=val&foo=bar', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {key: 'val', foo: 'bar'}, 'Sensed Qstring, non-empty object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test7: function (test) {
		var result = objectify('key=val&foo=bar');
		var testerr = new Error('error');
		test.expect(2);
		test.notEqual(result, testerr);
		test.deepEqual(result, {key: 'val', foo: 'bar'}, 'Synchronous Qstring, non-empty object');
		test.done();
	},
	test8: function (test) {
		test.expect(4);
		var as = 0;
		objectify('key=val&foo=bar', 'xml json qstring', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, {'key': 'val', 'foo': 'bar'}, 'Sensed Qstring, Qstring allowed');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test9: function (test) {
		test.expect(4);
		var as = 0;
		objectify('key=val&foo=bar', 'xml, json', function(err, result) {
			var testerr = new Error('error');
			test.equal(++as, 2, 'Async B');
			test.deepEqual(err, testerr, 'Sensed Qstring, Qstring not allowed error');
			test.equal(result, null, 'Sensed Qstring, Qstring not allowed result');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	}
}

var smplobj = { key: 'val', foo: 'bar' };
var xmlobj = { key: { $: { foo: 'bar' }, _: 'val' } };

exports.stringify = {
	test0: function (test) {
		test.expect(4);
		var as = 0;
		stringify({}, 'qstring', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, '', 'Stringify Qstring, empty object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test1: function (test) {
		test.expect(4);
		var as = 0;
		stringify({}, 'json', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, '{}', 'Stringify JSON, empty object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test2: function (test) {
		test.expect(4);
		var as = 0;
		stringify({}, 'xml', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root/>', 'Stringify XML, empty object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test3: function (test) {
		test.expect(4);
		var as = 0;
		stringify(smplobj, 'qstring', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, 'key=val&foo=bar', 'Stringify Qstring, simple object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test4: function (test) {
		test.expect(4);
		var as = 0;
		stringify(smplobj, 'json', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, '{"key":"val","foo":"bar"}', 'Stringify JSON, simple object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test5: function (test) {
		test.expect(4);
		var as = 0;
		stringify(smplobj, 'xml', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><root><key>val</key><foo>bar</foo></root>', 'Stringify XML, simple object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test6: function (test) {
		test.expect(4);
		var as = 0;
		stringify(xmlobj, 'xml', function(err, result) {
			test.equal(++as, 2, 'Async B');
			test.equal(err, null);
			test.deepEqual(result, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><key foo="bar">val</key>', 'Stringify XML, complext object');
			test.done();
		});
		test.equal(++as, 1, 'Async A');
	},
	test7: function (test) {
		var result = stringify(smplobj); // qstring
		var testerr = new Error('error');
		test.expect(2);
		test.notEqual(result, testerr);
		test.deepEqual(result, 'key=val&foo=bar', 'Synchronous Qstring, simple object');
		test.done();
	}
}