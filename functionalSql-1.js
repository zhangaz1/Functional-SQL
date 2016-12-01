Array.prototype.findIndex = function(fn) {
  for (let i = 0; i < this.length; i++) if (fn(this[i])) return i;
  return -1;
};

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

function createDuplicateCallErrorHandler(key) {
	return function() {
		throw new Error('Duplicate ' + key);
	}
}

function decorate(obj, methodName, wrap) {
	wrap.origin = obj[methodName];
	obj[methodName] = wrap;
}

function product(a, arr) {
  if (arr.length==0) return a;
  let b = arr[0], res = [];
  for (let x of a) for (let y of b) res.push(x.concat(y));
  return product(res, arr.slice(1));
}

var splitor = ',';
var chainMethods = 'select,from,where,orderBy,groupBy,having'.split(splitor);
var onceMethods = 'select,from,orderBy,groupBy'.split(splitor);

function query() {
  let s = {  where: [], having: [] },
      q = {
        select: function(fn){
          s.select = fn || (x => x);
        },
        from: function(a, ...arr){
          s.from = () => arr.length == 0 ? a : product(a.map(x=>[x]), arr);
        },
        where: function(...fns){
          s.where.push(x => fns.some(fn => fn(x)));
        },
        orderBy: function(fn){
          s.orderBy = fn;
        },
        groupBy: function(...fns){
          s.groupBy = a => a.reduce((res, row) => {
            let a = res, b;
            for(let fn of fns) {
              let group = fn(row);
              let i = a.findIndex(x => x[0] == group);
              if (i<0) a.push([group, a = []]); else a = a[i][1];
            }
            a.push(row);
            return res;
          }, []);
        },
        having: function(...fns){
          s.having.push(x => fns.some(fn => fn(x)));
        },
        execute: function(){
          let res = s.from ? s.from() : [];
          res = res.filter(x => s.where.every(fn => fn(x)));
          if (s.groupBy) res = s.groupBy(res);
          res = res.filter(x => s.having.every(fn => fn(x)));
          if (s.orderBy) res.sort(s.orderBy);
          return s.select ? res.map(s.select) : res;
        }
      };

	chainMethods.forEach(methodName => chinify(q, methodName));
	onceMethods.forEach(methodName => onceify(q, methodName));

  return q;
}
