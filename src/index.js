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
	this.orderByor = null;
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
	proto.doOrderBy = doOrderBy;

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
		var sources = argumentsToArray(arguments);
		this.result =
			this.sources = (
				sources.length === 1 ?
				sources[0] :
				sources
			);
	}

	function where() {
		var filters = getMethodsFromArguments(arguments);

		filters.forEach(function(filter) {
			if(isFunction(filter)) {
				this.filters.push(filter);
			}
		}, this);
	}

	function doFilter() {
		this.filters.forEach(function(filter) {
			this.result = this.result.filter(filter);
		}, this);
	}

	function orderBy(orderBy) {
		if(isFunction(orderBy)) {
			this.orderByor = orderBy;
		}
	}

	function doOrderBy() {
		if(this.orderByor) {
			this.result = this.result.sort(this.orderByor);
		}
	}

	function groupBy() {
		var groupBys = getMethodsFromArguments(arguments);

		groupBys.forEach(function(groupBy) {
			if(isFunction(groupBy)) {
				this.groupBys.push(groupBy);
			}
		}, this);
	}

	function doGroup() {
		this.result = group(this.result, this.groupBys);
	}

	function having() {}

	function execute() {
		this.doFilter();
		this.doGroup();
		this.doSelect();
		this.doOrderBy();

		return this.result;
	}

}

function getMethodsFromArguments(args) {
	return argumentsToArray(args);
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
