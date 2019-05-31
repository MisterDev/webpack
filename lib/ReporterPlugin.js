/*
MIT License http://www.opensource.org/licenses/mit-license.php
Author Devid Farinelli @misterdev
*/

/*
TODO 
- multicompiler

 TODO
 - choose which hooks to listen
 - reporter plugin configuration
 
 HOOK THROTTLING:
 - always includes first and last within same threshold

 NEXT
 - hook order
 - benchmarks
 - formatting utility
*/

"use strict";

const { Tapable, SyncWaterfallHook } = require("tapable");
const Reporter = require("./Reporter");

/**
 * @typedef { import("./Stats") } Stats
 *
 * @typedef {object} HookData - creates a new type named 'HookData'
 * @property {string} [context] - hook context
 * @property {string} name - hook's name
 * @property {number} count - number of times the hook is executed
 * @property {string} configHash - current webpack configuration hash
 * @property {Stats | string} [data] - custom hook data
 */

class ReporterPlugin extends Tapable {
	constructor(options) {
		super();
		this.REPORTER_PLUGIN = "ReporterPlugin";

		this.hooks = {
			/** @type {SyncWaterfallHook<HookData>} */
			info: new SyncWaterfallHook(["info"]),
			/** @type {SyncWaterfallHook<HookData>} */
			warn: new SyncWaterfallHook(["warn"]),
			/** @type {SyncWaterfallHook<HookData>} */
			error: new SyncWaterfallHook(["error"]),
			/** @type {SyncWaterfallHook<HookData>} */
			stats: new SyncWaterfallHook(["stats"])
		};

		this.hookStats = {
			compiler: {},
			compilation: {
				buildModule: {
					name: "compilation.hooks.buildModule",
					count: 0,
					throttle: 5 // display 1/5 messages
				}
			}
		};
		this.compilerHooks = [
			"beforeRun",
			"run",
			"watchRun",
			"beforeCompile",
			"compile",
			"compilation",
			"emit",
			"done",
			"failed",
			"invalid",
			"watchClose"
		];

		// TODO add validateOptions(schema, options, "Reporter Plugin");
		options = Object.assign({}, ReporterPlugin.defaultOptions, options);
		this.reporters = options.reporters;
	}

	apply(compiler) {
		const self = this;
		// TODO remove hardcoded
		const outputOptions = compiler.options.stats || {
			context: "D:\\Workspace\\OSS\\WEBPACK\\testlogger",
			colors: { level: 3, hasBasic: true, has256: true, has16m: true },
			cached: false,
			cachedAssets: false,
			exclude: ["node_modules", "bower_components", "components"],
			infoVerbosity: "info"
		};

		self.reporters.forEach(reporter => reporter.apply(self, outputOptions));

		compiler.hooks.compilation.tap(self.REPORTER_PLUGIN, compilation =>
			self.onCompilation(compilation)
		);

		self.compilerHooks.forEach(hookName => {
			self.hookStats.compiler[hookName] = {
				name: `compiler.hooks.${hookName}`,
				count: 0
			};

			compiler.hooks[hookName].tap(self.REPORTER_PLUGIN, (...args) => {
				const hook = self.hookStats.compiler[hookName];
				const hookData = self.generateHookData(hook);
				// Emit the log
				self.hooks.info.call(hookData);
			});
		});
		// // For each hook
		// compiler.hooks.beforeRun.tap(self.REPORTER_PLUGIN, compiler => {
		// 	let hook = self.hookStats.compiler.beforeRun;
		// 	self.incrementHookCount(hook);
		// 	/* @type {HookData} */
		// 	const hookData = self.generateHookData(hook);
		// 	// Emit the log
		// 	self.hooks.info.call(hookData);
		// });
	}

	onCompilation(compilation) {
		const self = this;

		compilation.hooks.buildModule.tap(self.REPORTER_PLUGIN, data => {
			let hook = self.hookStats.compilation.buildModule;
			self.incrementHookCount(hook);
			if (self.shouldEmit(hook)) {
				/* @type {HookData} */
				const hookData = self.generateHookData(hook, data);
				self.hooks.info.call(hookData);
			}
		});
	}

	/**
	 * @param {Object} hook // TODO
	 * @returns {boolean} true if it should emit
	 */
	shouldEmit(hook) {
		if (!hook.throttle) return true;
		else return hook.count % hook.throttle === 0;
	}

	/**
	 * @param {Object} hook // TODO
	 * @param {Object} [data] custom hook data
	 * @returns {HookData} HookData
	 */
	generateHookData(hook, data) {
		return {
			context: "/foo/bar", // TODO
			name: hook.name,
			count: hook.count,
			configHash: "abcdefgh", // TODO
			data
		};
	}

	incrementHookCount(hook) {
		hook.count += 1;
	}
}

ReporterPlugin.defaultOptions = {
	hooks: ["run", "stats"],
	throttledHooks: {
		buildModule: 200
	},
	reporters: [new Reporter()]
};

module.exports = ReporterPlugin;

// this.compilationHook = [
// 	"buildModule",
// 	"rebuildModule",
// 	"failedModule",
// 	"succeedModule",
// 	"finishModules",
// 	"seal",
// 	"unseal",
// 	"optimizeDependencies",
// 	"afterOptimizeDependencies",
// 	"optimize",
// 	"optimizeModules",
// 	"afterOptimizeModules",
// 	"optimizeChunks",
// 	"afterOptimizeChunks",
// 	"optimizeTree",
// 	"afterOptimizeTree",
// 	"optimizeChunkModules",
// 	"afterOptimizeChunkModules",
// 	"moduleIds",
// 	"optimizeModuleIds",
// 	"afterOptimizeModuleIds",
// 	"chunkIds",
// 	"optimizeChunkIds",
// 	"afterOptimizeChunkIds",
// 	"beforeModuleHash",
// 	"afterModuleHash",
// 	"record",
// 	"optimizeChunkAssets",
// 	"afterOptimizeChunkAssets",
// 	"moduleAsset"
// ];

// this.compilerHooks = [
// 	"finishModules",
// 	"seal",
// 	"beforeChunks",
// 	"afterChunks",
// 	"optimizeDependenciesBasic",
// 	"optimizeDependencies",
// 	"optimizeDependenciesAdvanced",
// 	"afterOptimizeDependencies",
// 	"optimize",
// 	"optimizeModules",
// 	"afterOptimizeModules",
// 	"optimizeChunks",
// 	"afterOptimizeChunks",
// 	"optimizeTree",
// 	"afterOptimizeTree",
// 	"optimizeChunkModules",
// 	"afterOptimizeChunkModules",
// 	"reviveModules",
// 	"optimizeModuleOrder",
// 	"advancedOptimizeModuleOrder",
// 	"beforeModuleIds",
// 	"moduleIds",
// 	"optimizeModuleIds",
// 	"afterOptimizeModuleIds",
// 	"reviveChunks",
// 	"optimizeChunkOrder",
// 	"beforeChunkIds",
// 	"optimizeChunkIds",
// 	"afterOptimizeChunkIds",
// 	"recordModules",
// 	"recordChunks",
// 	"beforeHash",
// 	"contentHash",
// 	"afterHash",
// 	"recordHash",
// 	"beforeModuleAssets",
// 	"beforeChunkAssets",
// 	"additionalChunkAssets",
// 	"record",
// 	"additionalAssets",
// 	"optimizeChunkAssets",
// 	"afterOptimizeChunkAssets",
// 	"optimizeAssets",
// 	"afterOptimizeAssets",
// 	"afterSeal",
// 	"emit",
// 	"afterEmit",
// 	"done"
// ];
