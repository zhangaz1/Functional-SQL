'use strict';


module.exports = function (context, name) {
	var tasks = context.config.tasks;
	var cacheManager = context.cacheManager;

	context.gulp
		.task(
			name,
			'run nodemmon index.js task',
			function (done) {
				var webProcess = cacheManager.get(name);
				if (!webProcess) {
					context.execCmd(' nodemon ');
					cacheManager.set(name, true);
				}

				done(null);
			}
		);
};
