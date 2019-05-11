/*
MIT License http://www.opensource.org/licenses/mit-license.php
Author Devid Farinelli @misterdev
*/

"use strict";

/*
	Plugin parameters:
	options = {
		throttle: 200, // ms
		// or
		throttle: {
			default: 200, // ms
			beforeRun: 400, // to specify a specific hook loudness
		},
		reporters: [
			require.resolve("../../lib/Reporter")
			...
		]
	}

*/
const EventEmitter = require("events").EventEmitter;

class ReporterPlugin {
	constructor(options) {
		this.logs = new EventEmitter();

		// Imports the reporter given as parameter
		const Reporter = require(options.reporters[0]);
		this.reporters = [new Reporter(this.logs)];
		// TODO validateOptions(schema, options, "Reporter Plugin");
	}

	apply(compiler) {
		const self = this;
		// For each hook
		compiler.hooks.beforeRun.tap("ReporterPlugin", compiler => {
			// Emit the log
			// TODO ? if(self.logs.listenerCount("info") > 0)
			self.logs.emit("info", {
				context: "/foo/bar",
				hook: "compiler.hooks.buildModule",
				count: 2342,
				configHash: "abcdefgh",
				message: "building module"
			});
		});
	}
}

module.exports = ReporterPlugin;
