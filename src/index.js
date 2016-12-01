var splitor = ',';
var chainMethods = 'select,from,where,orderBy,groupBy,having'.split(splitor);
var onceMethods = 'select,from,orderBy,groupBy'.split(splitor);

buildFunctionalSQLPrototype();

var query = createQuery;

// return void(0);

function FunctionalSQL() {
	this.result =
		this.sources = [];

	this.selector = null;
	this.wheres = [];
	this.havings = [];
	this.groupBys = [];
	this.orderByor = null;

}

function buildFunctionalSQLPrototype() {
	var proto = FunctionalSQL.prototype;

	proto.select = select;
	proto.doSelect = doSelect;

	proto.from = from;

	proto.where = where;
	proto.doWhere = doWhere;

	proto.orderBy = orderBy;
	proto.doOrderBy = doOrderBy;

	proto.groupBy = groupBy;
	proto.doGroup = doGroup;

	proto.having = having;
	proto.doHaving = doHaving;

	proto.execute = execute;

	chainMethods.forEach(methodName => chinify(proto, methodName));
	onceMethods.forEach(methodName => onceify(proto, methodName));

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

		if(sources.length < 1) {
			return;
		}

		this.result =
			this.sources = (
				sources.length === 1 ?
				sources[0].slice() :
				joinSources(sources)
			);
	}

	function where() {
		var wheres = getMethodsFromArguments(arguments);
		if(wheres.length > 0) {
			var filter = wheres.length === 1 ?
				wheres[0] :
				mergeOrFilters(wheres);

			this.wheres.push(filter);
		}
	}

	function doWhere() {
		this.result = doFilter(this.result, this.wheres);
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

	function having() {
		var havings = getMethodsFromArguments(arguments);

		havings.forEach(function(having) {
			if(isFunction(having)) {
				this.havings.push(having);
			}
		}, this);
	}

	function doHaving() {
		this.result = doFilter(this.result, this.havings);
	}

	function execute() {
		this.doWhere();
		this.doGroup();
		this.doHaving();
		this.doSelect();
		this.doOrderBy();

		return this.result;
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

function mergeOrFilters(filters) {
	return function() {
		var args = arguments;
		return filters.some(filter => filter.apply(null, arguments));
	}
}

function mergeAndFilters(filters) {
	return function() {
		var args = arguments;
		return filters.every(filter => filter.apply(null, args));
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
	decorate(obj, methodName, wrap);

	return void(0);

	function wrap() {
		wrap.origin.apply(this, arguments);
		return this;
	}
}

function onceify(obj, methodName) {
	decorate(obj, methodName, wrap);

	return void(0);

	function wrap() {
		var result = wrap.origin.apply(this, arguments);
		this[methodName] = createDuplicateCallErrorHandler(methodName.toUpperCase());
		return result;
	}
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
