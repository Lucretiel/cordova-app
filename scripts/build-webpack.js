// This script is run as a cordova prepare hook. It runs a webpack build,
// copying data to www/js/bundle.js
const Rx = require('rxjs')
const ops = require('rxjs/operators')
const { spawn } = require('child_process')

module.exports = context => {
	const isRelease = context.opts.options.release || false;
	const webpackMode = isRelease ? "production" : "development";

	const webpackChild = spawn('npx', ['webpack', '--mode', webpackMode], {
		cwd: context.opts.projectRoot,
		stdio: 'inherit',
	});

	const errorObs = Rx.fromEvent(webpackChild, 'error').pipe(
		ops.map(err => { throw err })
	);

	const exitObs = Rx.fromEvent(webpackChild, 'exit').pipe(
		ops.map(([code, signal]) => {
			if(signal) {
				throw new Error(`webpack exited with signal: ${signal}`)
			} else if(code !== 0) {
				throw new Error(`webpack exited with error code ${code}`)
			}
		})
	);

	return Rx.merge(errorObs, exitObs).pipe(ops.take(1)).toPromise()
}
