var splitor = ',';
var chainMethods = 'select,from,where,orderBy,groupBy,having'.split(splitor);
var onceMethods = 'select,from,orderBy,groupBy,having'.split(splitor);

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
		chinify(proto, methodName);
	});

	onceMethods.forEach(function(methodName) {
		onceify(proto, methodName);
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

	function orderBy() {

	}

	function groupBy(groupBy) {
		if(isFunction(groupBy)) {
			this.groupBys.push(groupBy);
		}
	}

	function doGroup() {
		this.result = group(this.result, this.groupBys);
	}

	function having() {}

	function execute() {
		this.doFilter();
		this.doGroup();
		this.doSelect();

		return this.result;
	}

}

function group(datas, groupBys) {
	if(groupBys.length < 1) {
		return datas;
	}

	var groupObjects = groupToGroupObjects(datas, groupBys);
	return convertToResult(groupObjects);
}

function convertToResult(groupObjects) {
	var container = new ConvertContainer();

	groupObjects.forEach(function(groupObject) {
		let currentContainer = container;

		groupObject.groups.forEach(function(group) {
			let nextContainer = currentContainer[group];
			if(!nextContainer) {
				nextContainer =
					currentContainer[group] = new ConvertContainer();

				currentContainer.result.push([group, nextContainer.result]);
			}
			currentContainer = nextContainer;
		});

		currentContainer.result.push(groupObject.data);
	});

	return container.result;
}

function ConvertContainer() {
	return {
		dic: createEmptyDic(),
		result: [],
	};
}

function groupToGroupObjects(datas, groupBys) {
	return datas.map(function(data) {
		var groupObject = new GroupObject(data);

		groupBys.forEach(function(groupBy) {
			groupObject.groups.push(groupBy(data));
		});

		return groupObject;
	});
}

function GroupObject(data) {
	this.data = data;
	this.groups = [];
}

function isFunction(fun) {
	return Object.prototype.toString.call(fun) === '[object Function]';
}

function createEmptyDic() {
	return Object.create(null);
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

function onceify(obj, methodName) {
	wrap.origin = obj[methodName];
	obj[methodName] = wrap;
	return void(0);

	function wrap() {
		var result = wrap.origin.apply(this, arguments);
		this[methodName] = createDuplicateCallErrorHandler(methodName.toUpperCase());
		return result;
	}
}

function createDuplicateCallErrorHandler(key) {
	return function() {
		throw new Error(key);
	}
}

function createQuery() {
	return new FunctionalSQL();
}
