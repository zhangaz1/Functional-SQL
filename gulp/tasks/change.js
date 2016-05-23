'use strict';


module.exports = function (context, name) {
	var tasks = context.config.tasks;
	var cacheManager = context.cacheManager;

	context.gulp
		.task(
			name,
			'src or test change',
			function (done) {
				context.sequence(
					// tasks.hint,
					tasks.test
				)(done);
			}
		);
};
