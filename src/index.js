var chainMethods = 'select,from,where,orderBy,groupBy,having'.split(',');


buildFunctionalSQLPrototype();

var query = createQuery;

// return void(0);

function FunctionalSQL() {
	this.sources = [];
	this.result = [];
}

function buildFunctionalSQLPrototype() {
	FunctionalSQL.prototype.select = select;
	FunctionalSQL.prototype.from = from;
	FunctionalSQL.prototype.where = where;
	FunctionalSQL.prototype.orderBy = orderBy;
	FunctionalSQL.prototype.groupBy = groupBy;
	FunctionalSQL.prototype.having = having;
	FunctionalSQL.prototype.execute = execute;

	chainMethods.forEach(function(methodName) {
		chinify(FunctionalSQL.prototype, methodName);
	});

	return void(0);

	function select() {}

	function from() {
		this.sources = argumentsToArray(arguments);
	}

	function where() {}

	function orderBy() {}

	function groupBy() {}

	function having() {}

	function execute() {
		return this.result;
	}

}

function argumentsToArray(args) {
	return Array.prototype.slice.call(args);
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
