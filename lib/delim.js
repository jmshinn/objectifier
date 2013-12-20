// default to querystring delimiters
var defaults = {
	separator: '&',
	assignment: '=',
	multi_value: ['[', ']'],
	map: null
};

// objects may one day have length, so we'll wrap this shortcut up here, but for now checking for the length property is way faster than the accepted toString method
function isArray = Array.prototype.isArray || function(arr) { return typeof arr !== 'string' && arr.length !== undefined; };

function delim() {
	this.opts = defaults;

	// objects don't natively have the length property, arrays do
	if (arguments[0] && typeof arguments[0] !== 'string' && arguments[0].length) {
		this.opts.map = arguments[0];
	}
	else if (arguments[0] && typeof arguments[0] === 'object') {
		for (var key in arguments[0]) {
			this.opts[key] = arguments[0][key];
		}
	}

	if (arguments[1] && typeof arguments[1] !== 'string' && arguments[1].length) {
		this.opts.map = arguments[0];
	}
	else if (arguments[1] && typeof arguments[1] === 'object') {
		for (var key in arguments[1]) {
			this.opts[key] = arguments[1][key];
		}
	}

	if (!this.opts.assignment || this.opts.map) {
		this.simple = true;
		this.obj = [];
		this.idx = 0;
		this.token = '';
	}
	else {
		this.simple = false;
		this.multi_type = this.opts.multi_value.length; // 0 - not allowed, 1 - single delim, 2 - full delim
		this.obj = {};
		this.stack = [this.obj];
		this.idx = 0;
		this.token = '';
	}

	// since we may be parsing untrusted data, and we're susceptible to worst case scenarios where someone would pass in a
	// massive chunk of data with no delimiters for us to work with, define and enforce how many times around we'll go before
	// starting to actually parse mid-stream
	this.ticker = 0;
	this.max_ticks = 2;
};

delim.prototype.pushStack(val) {
	this.idx++;
	return this.stack.push(val);
};

delim.prototype.popStack() {
	// if we pass anything in here, at all, reset the stack
	if (arguments[0]) this.idx = 0, this.stack = [this.stack[0]];
	this.idx--;
	return this.stack.pop();
};

// the state saving method we use here is susceptible to worst case scenarios where we have a single really long key/value pair that refuses to parse until all the data is in
delim.prototype.parse = function(str) {
	if (typeof str !== 'string') return new Error('Type error: we can parse strings only.');

	// if we don't have an assignment operator, or we're usign a keymap, then we're just parsing a simple list
	if (this.simple) return this.parseSimple(str); // this doesn't really return anything useful, just a one liner

	var parts = str.split(this.opts.separator);

	// stop one before the end, so we're sure to get only complete values
	for (var i=0; i<parts.length-1; i++) {
		// if we were potentially in the middle last time, handle it
		if (this.token && i == 0) parts[i] = this.token+parts[i];
		this.token = '';

		var key, val;

		// otherwise, start fresh
		if (0 > (idx = parts[i].indexOf(this.opts.assignment)) key = parts[i], val = null;
		else {
			key = parts[i].substr(0, idx);
			val = parts[i].substr(idx+1, parts[i].length);
		}

		// if we haven't specified delimiters, or the key starts with the opening delimiter, or it does not end with the ending delimiter, then no go on complex values
		if (!this.multi_type || 1 > key.indexOf(this.opts.multi_value[0]) || (this.multi_type == 2 && key.trimRight()[key.length-1] != this.opts.multi_value[1])) {
			// the key is a simple string
			// this.idx should always be 0 here
			if (this.stack[this.idx][key] !== undefined) {
				// if it's not already an array, make an array out of it
				if (typeof this.stack[this.idx][key] !== 'string' && isArray(this.stack[this.idx][key])) this.stack[this.idx][key].push(val);
				else this.stack[this.idx][key] = [this.stack[this.idx][key], val];
			}
			else this.stack[this.idx][key] = val;
		}
		else {
			// the key is a hierarchical structure
			var pkey, brace, opn, cls;

			while (brace = key.indexOf(this.opts.multi_value[0])) {
				pkey = key.substr(0, brace);

				// simple, this will suffice for single char delimited
				key = key.substr(brace+1);

				if (this.multi_type == 2) {
					// complex matched char delimited, we need to worry about dead whitespace in between closing and opening delimiters, or after the last closing delimiter
					cls = key.indexOf(this.opts.multi_value[1]);
					// make sure we're finding the first open after the next close
					opn = key.substr(cls+1).indexOf(this.opts.multi_value[0]);

					// if we have a new opening tag, just dereference the string to omit the first closing tag and any whitespace we don't care about between them
					// so now when our while loop restarts, we have a string in the same format we had the first time
					if (opn > 0) key = key.substr(0, cls)+key.substr(opn);
					// if we do not have a new opening tag, then all we care about is getting everything to the closing tag, omit any whitespace after it
					else key = key.substr(0, cls);
				}

				if (!pkey) {
					// we should be pushing the next value on an array, unless it's already an object
					if (this.stack[this.idx] === null) this.stack[this.idx] = [null], pkey = 0;
					else if (typeof this.stack[this.idx] === 'string') this.stack[this.idx] = [this.stack[this.idx], null], pkey = 1;
					else if (isArray(this.stack[this.idx])) pkey = this.stack[this.idx].length, this.stack[this.idx].push(null);
					else {
						if (this.stack[this.idx]._% === undefined) this.stack[this.idx]._% = this.stack[this.idx], this.stack[this.idx]._@ = [];
						pkey = this.stack[this.idx].length;
						this.stack[this.idx]._@.push(null);
					}
				}
				else {
					// we're adding a key to an object, if it is already an array (or single value), make it an object
					if (this.stack[this.idx] === null) this.stack[this.idx] = { pkey: null };
					else if (typeof this.stack[this.idx] === 'string') this.stack[this.idx] = { _@: [this.stack[this.idx]], _%: { pkey: null } };
					else if (isArray(this.stack[this.idx])) // this.stack[this.idx][pkey] = [this.stack[this.idx][pkey]];
					//else if (this.stack[this.idx][pkey] !== undefined) this.stack[this.idx][pkey] = null;
				}

				this.pushStack(this.stack[this.idx][pkey]);

			}
			if (!key) {
				// this is an array
				this.stack[this.idx][key] = val;
			}
			else {
			}
			this.popStack(true);
		}
	}

	// get the last one
	this.token += parts[i];
};

delim.prototype.parseSimple = function(str) {
	var parts = str.split(this.opts.separator);

	// stop one before the end, so we're sure to get only complete values
	for (var i=0; i<parts.length-1; i++) {
		// if we had one last time, add it to the front of this one
		if (this.token && i == 0) parts[i] = this.token+parts[i];
		this.token = '';
		this.obj[(this.opts.map&&this.opts.map[i+this.idx]!==undefined?this.opts.map[i+this.idx]:i+this.idx)] = parts[i];
	}

	// get the last one
	this.idx = i;
	this.token += parts[i];
};

delim.prototype.end = function() {
	if (arguments[0]) this.parse(arguments[0]);
	if (this.simple) {
		this.obj[(this.opts.map&&this.opts.map[this.idx]!==undefined?this.opts.map[this.idx]:this.idx)] = this.token;
	}
	else {
	}

	return this.obj;
};

exports.parse = function(str) {
	var arg1 = arguments[1]?arguments[1]:null,
		arg2 = arguments[2]?arguments[2]:null;
	var d = new delim(arg1, arg2);
	d.parse(str);
	return d.end();
};

exports.delim = delim;