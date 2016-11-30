var chainMethods = 'select,from,where,orderBy,groupBy,having'.split(',');


buildFunctionalSQLPrototype();

var query = createQuery;

// return void(0);

function FunctionalSQL() {
	this.sources = [];
	this.selector = null;
	this.filters = [];
	this.groupBys = [];
	this.result = [];
}

function buildFunctionalSQLPrototype() {
	var proto = FunctionalSQL.prototype;

	proto.select = select;
	proto.doSelect = doSelect;

	proto.from = from;

	proto.where = where;
	proto.doFilter = doFilter;

	proto.orderBy = orderBy;

	proto.groupBy = groupBy;
	proto.doGroup = doGroup;

	proto.having = having;

	proto.execute = execute;

	chainMethods.forEach(function(methodName) {
		chinify(FunctionalSQL.prototype, methodName);
	});

	return void(0);

	function select(selector) {
		if(isFunction(selector)) {
			this.selector = selector;
		}
	}

	function doSelect() {
		if(this.selector) {
			this.result = this.result.map(this.selector);
		}
	}

	function from() {
		this.result =
			this.sources = argumentsToArray(arguments);
	}

	function where(filter) {
		if(isFunction(filter)) {
			this.filters.push(filter);
		}
	}

	function doFilter() {
		this.filters.forEach(function(filter) {
			this.result = this.result.filter(filter);
		}, this);
	}

	function orderBy() {}

	function groupBy(groupBy) {
		if(isFunction(groupBy)) {
			this.groupBys.push(groupBy);
		}
	}

	function doGroup() {
		if(this.groupBys.length > 0) {
			this.result = group(this.result, this.groupBys);
		}
	}

	function having() {}

	function execute() {
		this.doFilter();
		this.doSelect();
		this.doGroup();

		return this.result;
	}

}

function group(data, groupBys) {
	return data;
}

function isFunction(fun) {
	return Object.prototype.toString.call(fun) === '[object Function]';
}

function argumentsToArray(args) {
	return args.length === 1 ?
		args[0] :
		Array.prototype.slice.call(args);
}

function chinify(obj, methodName) {
	wrap.origin = obj[methodName];
	obj[methodName] = wrap;
	return void(0);

	function wrap() {
		wrap.origin.apply(this, arguments);
		return this;
	}
}

function createQuery() {
	return new FunctionalSQL();
}
