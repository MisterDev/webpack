class Reporter {
	constructor(logs) {
		this.logs = logs;
		// Adss a listener for a specific log
		this.logs.addListener("info", this.onInfo);
	}

	onInfo(data) {
		// Formats and prints the output
		console.log("I'M THE REPORTER: ", data);
	}
}

module.exports = Reporter;
