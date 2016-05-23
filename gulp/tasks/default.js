'use strict';


module.exports = function (context, name) {
	var tasks = context.config.tasks;

	context.gulp
		.task(
			name,
			'default task',
			function (done) {
				context.sequence(
					// tasks.hint,
					// tasks.main,
					tasks.test,
					tasks.watch
				)(done);
			}
		);
};
