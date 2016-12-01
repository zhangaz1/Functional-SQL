var splitor = ',';
var chainMethods = 'select,from,where,orderBy,groupBy,having'.split(splitor);
var onceMethods = 'select,from,orderBy,groupBy'.split(splitor);

buildQueryCorePrototype();
buildFunctionalSQLPrototype();

var query = createQuery;

// return void(0);

function QueryCore() {
	this.result =
		this.sources = [];

	this.selector = null;
	this.wheres = [];
	this.havings = [];
	this.groupBys = [];
	this.orderByor = null;
}

function FunctionalSQL() {
	this.core = new QueryCore();
}

function buildQueryCorePrototype() {
	var proto = QueryCore.prototype;

	proto.select = select;
	proto.where = where;
	proto.orderBy = orderBy;
	proto.group = group;
	proto.having = having;
	proto.execute = execute;

	return void(0);

	function select() {
		if(this.selector) {
			this.result = this.result.map(this.selector);
		}
	}

	function where() {
		this.result = doFilter(this.result, this.wheres);
	}

	function orderBy() {
		if(this.orderByor) {
			this.result = this.result.sort(this.orderByor);
		}
	}

	function group() {
		this.result = doGroup(this.result, this.groupBys);
	}

	function having() {
		this.result = doFilter(this.result, this.havings);
	}

	function execute() {
		this.where();
		this.group();
		this.having();
		this.select();
		this.orderBy();

		return this.result;
	}
}

function buildFunctionalSQLPrototype() {
	var proto = FunctionalSQL.prototype;

	proto.select = select;
	proto.from = from;

	proto.where = where;
	proto.orderBy = orderBy;
	proto.groupBy = groupBy;
	proto.having = having;
	proto.execute = execute;

	chainMethods.forEach(methodName => chinify(proto, methodName));
	onceMethods.forEach(methodName => onceify(proto, methodName));

	return void(0);

	function select(selector) {
		if(isFunction(selector)) {
			this.core.selector = selector;
		}
	}

	function from() {
		var sources = argumentsToArray(arguments);

		if(sources.length < 1) {
			return;
		}

		this.core.result =
			this.core.sources = (
				sources.length === 1 ?
				sources[0].slice() :
				joinSources(sources)
			);
	}

	function where() {
		collectFilters(arguments, this.core.wheres);
	}

	function orderBy(orderBy) {
		if(isFunction(orderBy)) {
			this.core.orderByor = orderBy;
		}
	}

	function groupBy() {
		collectHanders(arguments, this.core.groupBys);
	}

	function having() {
		collectFilters(arguments, this.core.havings);
	}

	function execute() {
		return this.core.execute();
	}
}

function doFilter(list, filters) {
	var filter = mergeAndFilters(filters);
	return list.filter(filter);
}

function joinSources(sources) {
	var source = sources.shift();

	var result = source.map(dataObj => [dataObj]);

	while(source = sources.shift()) {
		result = joinSource(result, source);
	}

	return result;
}

function joinSource(mainSource, appendSource) {
	var result = [];

	mainSource.forEach(function(mainItem) {
		appendSource.forEach(function(appendItem) {
			let newItem = mainItem.slice();
			newItem.push(appendItem);
			result.push(newItem);
		});
	});

	return result;
}

function collectHanders(args, handlerCollection) {
	var handlers = getMethodsFromArguments(args);

	for(let handler of handlers) {
		if(isFunction(handler)) {
			handlerCollection.push(handler);
		}
	}
}

function collectFilters(args, filterCollection) {
	var filters = getMethodsFromArguments(args);

	if(filters.length > 0) {
		var filter = mergeOrFilters(filters);
		filterCollection.push(filter);
	}
}

function mergeOrFilters(filters) {
	return filters.length === 1 ?
		filters[0] :
		function() {
			var args = arguments;
			return filters.some(filter => filter.apply(null, arguments));
		};
}

function mergeAndFilters(filters) {
	return filters.length === 1 ?
		filters[0] :
		function() {
			var args = arguments;
			return filters.every(filter => filter.apply(null, args));
		};
}

function getMethodsFromArguments(args) {
	return argumentsToArray(args);
}

function doGroup(datas, groupBys) {
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
	decorate(obj, methodName, function() {
		arguments.callee.origin.apply(this, arguments);
		return this;
	});
}

function onceify(obj, methodName) {
	decorate(obj, methodName, function() {
		var result = arguments.callee.origin.apply(this, arguments);
		this[methodName] = createDuplicateCallErrorHandler(methodName.toUpperCase());
		return result;
	});
}

function decorate(obj, methodName, wrap) {
	wrap.origin = obj[methodName];
	obj[methodName] = wrap;
}

function createDuplicateCallErrorHandler(key) {
	return function() {
		throw new Error('Duplicate ' + key);
	}
}

function createQuery() {
	return new FunctionalSQL();
}
