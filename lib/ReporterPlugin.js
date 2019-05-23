/*
MIT License http://www.opensource.org/licenses/mit-license.php
Author Devid Farinelli @misterdev
*/

"use strict";

const { Tapable, SyncWaterfallHook } = require("tapable");

class ReporterPlugin extends Tapable {
	constructor(options) {
		super();
		this.hooks = {
			/** @type {SyncWaterfallHook<Object>} */
			info: new SyncWaterfallHook(["info"]),
			/** @type {SyncWaterfallHook<Object>} */
			warn: new SyncWaterfallHook(["warn"]),
			/** @type {SyncWaterfallHook<Object>} */
			error: new SyncWaterfallHook(["error"]),
			/** @type {SyncWaterfallHook<Object>} */
			stats: new SyncWaterfallHook(["stats"])
		};
		// TODO validateOptions(schema, options, "Reporter Plugin");
		// Imports the reporter given as parameter
		this.reporters = options.reporters;
	}

	apply(compiler) {
		const self = this;
		this.reporters.forEach(reporter => reporter.apply(self));

		// For each hook
		compiler.hooks.beforeRun.tap("ReporterPlugin", compiler => {
			// Emit the log
			// TODO ? if(self.logs.listenerCount("info") > 0)
			self.hooks.info.call({
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
