var objectify = require('../lib/objectifier').objectify;
var stringify = require('../lib/objectifier').stringify;

exports.JSON = {
	test0: function (test) {
		objectify('', 'json', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {}, 'Explicit JSON, trivially handle empty string');
			test.done();
		});
	},
	test1: function (test) {
		objectify('{}', 'json', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {}, 'Explicit JSON, empty object');
			test.done();
		});
	},
	test2: function (test) {
		objectify('{"key": "val"}', 'JSON', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {key: 'val'}, 'Explicit JSON, non-empty object');
			test.done();
		});
	},
	test3: function (test) {
		objectify('key=val&foo=bar', ' json ', function(err, result) {
			test.expect(2);
			var testerr = new Error('error');
			test.deepEqual(err, testerr, 'Explicit JSON, malformed string error');
			test.equal(result, null, 'Explicit JSON, malformed string result');
			test.done();
		});
	},
	test4: function (test) {
		objectify('{}', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {}, 'Sensed JSON, empty object');
			test.done();
		});
	},
	test5: function (test) {
		objectify('{"key": "val"}', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {key: 'val'}, 'Sensed JSON, non-empty object');
			test.done();
		});
	},
	test6: function (test) {
		objectify('{key=val&foo=bar}', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {'{key': 'val', 'foo': 'bar}'}, 'Sensed JSON, malformed string fallthru to querystring');
			test.done();
		});
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
		objectify('{"key": "val", "foo": "bar"}', 'xml qstring', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {'{"key": "val", "foo": "bar"}': ''}, 'Sensed JSON, JSON not allowed but querystring is, fallthru to querystring');
			test.done();
		});
	},
	test9: function (test) {
		objectify('{"key": "val", "foo": "bar"}', 'xml, json', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {'key': 'val', 'foo': 'bar'}, 'Sensed JSON, JSON allowed');
			test.done();
		});
	}
};

exports.XML = {
	test0: function (test) {
		objectify('', 'xml', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {}, 'Explicit XML, trivially handle empty string');
			test.done();
		});
	},
	test1: function (test) {
		objectify('<root></root>', 'xml', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {}, 'Explicit XML, empty object');
			test.done();
		});
	},
	test2: function (test) {
		objectify('<root><key>val</key></root>', 'XML', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {key: ['val']}, 'Explicit XML, non-empty object');
			test.done();
		});
	},
	test3: function (test) {
		objectify('<root><key foo="bar">val</key></root>', ' xml ', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {key: [{$: {foo: 'bar'}, _: 'val'}]}, 'Explicit XML, non-empty object with attributes');
			test.done();
		});
	},
	test4: function (test) {
		objectify('key=val&foo-bar', ' xml', function(err, result) {
			test.expect(2);
			var testerr = new Error('error');
			test.deepEqual(err, testerr, 'Explicit XML, malformed string error');
			test.equal(result, null, 'Explicit XML, malformed string result');
			test.done();
		});
	},
	test5: function (test) {
		objectify('<root></root>', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {}, 'Sensed XML, empty object');
			test.done();
		});
	},
	test6: function (test) {
		objectify('<root><key>val</key></root>', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {key: ['val']}, 'Sensed XML, non-empty object');
			test.done();
		});
	},
	test7: function (test) {
		objectify('<root><key foo="bar">val</key></root>', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {key: [{$: {foo: 'bar'}, _: 'val'}]}, 'Sensed XML, non-empty object with attributes');
			test.done();
		});
	},
	test8: function (test) {
		objectify('<key=val&foo=bar>', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {'<key': 'val', 'foo': 'bar>'}, 'Sensed XML, malformed string fallthru to querystring');
			test.done();
		});
	},
	test9: function (test) {
		var result = objectify('<root><key foo="bar">val</key></root>');
		var testerr = new Error('error');
		test.expect(2);
		test.notEqual(result, testerr);
		test.deepEqual(result, {key: [{$: {foo: 'bar'}, _: 'val'}]}, 'Synchronous XML, non-empty object with attributes');
		test.done();
	},
	test10: function (test) {
		objectify('<root><key foo="bar">val</key></root>', 'json qstring', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {'<root><key foo': '"bar">val</key></root>'}, 'Sensed XML, XML not allowed but querystring is, fallthru to querystring');
			test.done();
		});
	},
	test11: function (test) {
		objectify('<root><key foo="bar">val</key></root>', 'json, xml', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {key: [{$: {foo: 'bar'}, _: 'val'}]}, 'Sensed XML, XML allowed');
			test.done();
		});
	}
}

exports.qstring = {
	test0: function (test) {
		objectify('', 'query', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {}, 'Explicit Qstring, trivially handle empty string');
			test.done();
		});
	},
	test1: function (test) {
		objectify('', 'query', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {}, 'Explicit Qstring, empty object');
			test.done();
		});
	},
	test2: function (test) {
		objectify('key=val&foo=bar', 'querystring', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {key: 'val', foo: 'bar'}, 'Explicit Qstring, non-empty object');
			test.done();
		});
	},
	test3: function (test) {
		objectify('blah', 'qstring', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {blah: ''}, 'Explicit Qstring, only key');
			test.done();
		});
	},
	test4: function (test) {
		objectify('{"key": "val"}', 'query', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {'{"key": "val"}': ''}, 'Explicit Qstring, passed in JSON format');
			test.done();
		});
	},
	test5: function (test) {
		objectify('<root><key foo="bar">val</key></root>', 'qstring', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {'<root><key foo': '"bar">val</key></root>'}, 'Explicit Qstring, passed in XML format');
			test.done();
		});
	},
	test6: function (test) {
		objectify('key=val&foo=bar', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {key: 'val', foo: 'bar'}, 'Sensed Qstring, non-empty object');
			test.done();
		});
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
		objectify('key=val&foo=bar', 'xml json qstring', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, {'key': 'val', 'foo': 'bar'}, 'Sensed Qstring, Qstring allowed');
			test.done();
		});
	},
	test9: function (test) {
		objectify('key=val&foo=bar', 'xml, json', function(err, result) {
			var testerr = new Error('error');
			test.expect(2);
			test.deepEqual(err, testerr, 'Sensed Qstring, Qstring not allowed error');
			test.equal(result, null, 'Sensed Qstring, Qstring not allowed result');
			test.done();
		});
	}
}

var smplobj = { key: 'val', foo: 'bar' };
var xmlobj = { key: [{ $: { foo: 'bar' }, _: 'val' }] };

exports.stringify = {
	test0: function (test) {
		stringify({}, 'qstring', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, '', 'Stringify Qstring, empty object');
			test.done();
		});
	},
	test1: function (test) {
		stringify({}, 'json', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, '{}', 'Stringify JSON, empty object');
			test.done();
		});
	},
	test2: function (test) {
		stringify({}, 'xml', function(err, result) {
			test.expect(2);
			test.equal(err, null);
			test.deepEqual(result, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<root/>\n', 'Stringify XML, empty object');
			test.done();
		});
	}
}