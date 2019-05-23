class Reporter {
	apply(reporter) {
		// Adds a listener for a specific log
		reporter.hooks.info.tap("CustomReporter", data => {
			// Formats and prints the output
			console.log("I'M THE REPORTER: ", data);
		});
	}
}

module.exports = Reporter;
