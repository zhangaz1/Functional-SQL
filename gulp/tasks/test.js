'use strict';


module.exports = function (context, name) {

	context.gulp
		.task(
			name,
			'run test task',
			function (done) {
				context.gulp
					.src('test/**/*.test.js')
					.pipe(context.mocha())
					// .pipe(context.jasmine())
					.on('error', function () {
						console.log(arguments);
					})
					.on('end', function (err) {
						if (err) {
							console.log(err);
						}
						done(null);
					});
			}
		);
};
