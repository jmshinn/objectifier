# Objectifier

Objectifier is a format-agnostic translator from a string to a javascript object.

It's a fairly thin wrapper around JSON.parse, [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js "xml2js").parseString, and [qs](https://github.com/visionmedia/node-querystring "node-querystring").parse.  We gain 3 main benefits from this wrapper:

* It allows us to use a single interface to parse incoming data into easily digestible javascript objects.
* It allows us to not care about the actual format of incoming data, though if specific formats are malformed then you won't get the data structure you expect, it just won't cause an error
* Currently, both JSON parsing and querystring parsing are synchronous. Using this interface allows us to implement asynchronous methods in the future without any change in the interface.

## Usage

```js
var objectify = require('objectifier').objectify;

objectify('{ "key": "val", "foo": "bar" }', function(err, result) {
	// result:
	// {
	//	key: 'val',
	//	foo: 'bar'
	// }
});

objectify('<root><key foo="bar">val</key></root>', function(err, result) {
	// the result form is dictated by the standard workings of xml2js, currently we can't feed in any options
	// result:
	// {
	//	key: [
	//		{
	//			$: {foo: 'bar'},
	//			_: 'val'
	//		}
	//	]
	// }
});

objectify('key[]=val&key[]=bar', function(err, result) {
	// result:
	// {
	//	key: [
	//		'val',
	//		'bar'
	//	]
	// }
});
```

It can also be called in a synchronous context:

```js
var jsonresult = objectify('{ "key": "val", "foo": "bar" }');
var xmlresult = objectify('<root><key foo="bar">val</key></root>');
var qstringresult = objectify('key[]=val&key[]=bar');
```

... it's important to note that as of now (version 0.0.1), both JSON and querystring process synchronously in either case.  Only XML will process asynchronously.

## Error checking

If you want to catch and handle errors, e.g. you expect your data in a particular format, then you can pass that format in to objectify and if it fails to parse in that format, then it will pass back an appropriate error message.

```js
objectify('key=val&foo=bar', 'json', function(err, result) {
	// err indicates a failure to parse
	// result is empty
});
```

## More documentation to come, in the meantime just check out the code directly, it's fairly straight forward

## License

The MIT License (MIT)

Copyright (c) 2013 Jason Shinn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.