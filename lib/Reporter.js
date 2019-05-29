class Reporter {
	apply(reporter, outputOptions) {
		// Adds a listener for a specific log
		reporter.hooks.info.tap("Reporter", hookData => {
			// Formats and prints the output
			console.log("[REPORTER]:", hookData.hook, hookData.count);
		});

		reporter.hooks.stats.tap("Reporter", hookData => {
			console.log("[REPORTER]: ", hookData.hook);
			const statsString = hookData.data.toString(outputOptions);
			if (statsString) process.stdout.write(`${statsString}\n${"delimiter"}`);
		});
	}
}

module.exports = Reporter;
