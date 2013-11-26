var objectify = require('../lib/objectifier').objectify;

exports.JSON = {
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
	}
};

exports.XML = {
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
	}
}

exports.qstring = {
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
	}
}