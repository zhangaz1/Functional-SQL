var query = function() {
	return {
		selector: undefined,
		conditions: [],
		havingGroups: [],
		orderManager: undefined,
		grouppers: undefined,
		targets: undefined,

		indexTable: undefined,

		select: function(selector) {
			if(this.selector != undefined)
				throw new Error("Duplicate SELECT");

			if(selector != undefined)
				this.selector = selector;
			else
				this.selector = function(object) {
					return object;
				};

			return this;
		},
		from: function(...targets) {
			if(this.targets != undefined)
				throw new Error("Duplicate FROM");

			this.targets = targets;
			if(this.targets === undefined) this.targets = null;
			this.indexTable = Array.apply(null, Array(targets.length)).map(Number.prototype.valueOf, 0);
			return this;
		},
		where: function(...condition) {
			this.conditions.push(condition);
			return this;
		},
		orderBy: function(orderManager) {
			if(this.orderManager != undefined)
				throw new Error("Duplicate ORDERBY");

			this.orderManager = orderManager;
			return this;
		},
		groupBy: function(...grouppers) {
			if(this.grouppers != undefined)
				throw new Error("Duplicate GROUPBY");

			this.grouppers = grouppers;
			return this;
		},
		having: function(...havingGroups) {
			this.havingGroups.push(havingGroups);
			return this;
		},
		execute: function() {
			if(this.selector == undefined) this.selector = function(object) {
				return object;
			};
			if(this.condition == undefined) this.condition = function(object) {
				return true;
			};

			var list = [];
			var canBeAdded;

			if(this.targets == null) return [];

			var dataTable = getNextTarget(this.targets, this.indexTable);
			this.indexTable = dataTable["indexTable"];
			var target = dataTable["target"];

			while(true) {
				canBeAdded = true;
				for(var conditionId in this.conditions) {
					if(typeof(this.conditions[conditionId]) == 'function') {
						if(!this.conditions[conditionId](target))
							canBeAdded = false;
					} else {
						var redAdd = true;
						for(var ORConditionId in this.conditions[conditionId])
							if(this.conditions[conditionId][ORConditionId](target))
								redAdd = false;
						if(redAdd) canBeAdded = false;
					}
				}

				if(canBeAdded) {
					if(this.grouppers == undefined)
						list.push(target);
					else {
						var path = "";
						var arrCpy = list;
						for(var now = 0; now < this.grouppers.length; now++) {
							var groupName = this.grouppers[now](target);

							if(getGroupIndex(arrCpy, groupName) == -1) {
								var groupToAdd = groupName;
								if(typeof(groupToAdd) == 'string') groupToAdd = `"${groupToAdd}"`;
								eval(`list${path}.push( [${groupToAdd}, []] )`);
							}
							path += '[' + getGroupIndex(arrCpy, groupName) + '][1]';
							arrCpy = eval(`list${path}`);
						}
						arrCpy.push(target);
					}
				}

				dataTable = getNextTarget(this.targets, this.indexTable);
				this.indexTable = dataTable["indexTable"];
				target = dataTable["target"];
				if(dataTable["index"] == 0) break;
			}

			var tempList = [];
			for(var now = 0; now < list.length; ++now) {
				canBeAdded = true;
				for(var conditionId in this.havingGroups) {
					if(typeof(this.havingGroups[conditionId]) == 'function') {
						if(!this.havingGroups[conditionId](list[now]))
							canBeAdded = false;
					} else {
						var redAdd = true;
						for(var ORConditionId in this.havingGroups[conditionId])
							if(this.havingGroups[conditionId][ORConditionId](list[now]))
								redAdd = false;
						if(redAdd) canBeAdded = false;
					}
				}

				if(canBeAdded) tempList.push(list[now]);
			}
			list = tempList;

			var tempList = [];
			for(var now = 0; now < list.length; ++now) {
				tempList.push(this.selector(list[now]));
			}
			list = tempList;

			if(this.orderManager != undefined)
				list = list.sort(this.orderManager);

			return list;
		}
	}
};

function getGroupIndex(array, groupName) {
	try {
		for(var now = 0; now < array.length; ++now)
			if(array[now][0] == groupName)
				return now;
	} catch(Exception) {}
	return -1;
}

function getNextTarget(targets, indexTable) {
	var target = [];
	for(var now = 0; now < targets.length; ++now)
		target.push(targets[now][indexTable[now]]);
	if(target.length == 1) target = target[0];

	var totalIndex = 0;
	var multiplier = 1;

	for(var now = targets.length - 1; now >= 0; --now) {
		totalIndex += indexTable[now] * multiplier;
		multiplier *= targets[now].length;
	}

	for(var now = indexTable.length - 1; now >= 0; --now) {
		++indexTable[now];
		if(indexTable[now] >= targets[now].length) {
			indexTable[now] = 0;
			continue;
		}
		break;
	}

	return {
		"target": target,
		"indexTable": indexTable,
		"index": totalIndex
	};
}
