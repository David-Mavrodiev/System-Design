const axios = require('axios');

class Benchmarker {
    constructor(name, endpoint, requestsCount) {
        this.name = name;
        this.endpoint = endpoint;
        this.requestsCount = requestsCount;
        this.successfulRequests = 0;
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async measure() {
        this.start = Date.now();
        const requests = [];
        for (let i = 0; i < this.requestsCount; i++) {
            await Benchmarker.sleep(250);
            requests.push(axios.get(this.endpoint).then(() => this.successfulRequests ++).catch((err) => {}));
        }

        await Promise.all(requests);
        this.end = Date.now();
        this.executionInMilliseconds = (this.end - this.start);
    }

    get timeFormatted() {
        let seconds = Math.trunc(this.executionInMilliseconds / 1000);
        let milliseconds = this.executionInMilliseconds % 1000;
        if (seconds < 60) {
            return `${seconds}s ${milliseconds}m`;
        }

        let minutes = Math.trunc(seconds / 60);
        seconds = seconds % 60;
        if (minutes < 60) {
            return `${minutes}m ${seconds}s ${milliseconds}m`
        }
    }

    printResults() {
        console.log(`----------------------------------------`);
        console.log(`Name: ${this.name}`);
        console.info(`Made ${this.requestsCount} requests...`);
        console.info(`Successful: ${this.successfulRequests}`);
        console.info(`Failed: ${this.requestsCount - this.successfulRequests}`);
        console.info(`Time taken: ${this.timeFormatted} (${this.end - this.start})`);
        console.log(`----------------------------------------\n`);
    }
}

async function benchmark() {
    const singleServerApp = new Benchmarker("Single Server App", "http://localhost:5000", 160 * 2 * 2 * 2 * 2 / 2 / 2);
    await singleServerApp.measure();
    singleServerApp.printResults();

    Benchmarker.sleep(5000);

    const loadBalancedApp = new Benchmarker("Load Balanced App", "http://localhost:3000", 160 * 2 * 2 * 2 * 2 / 2 / 2);
    await loadBalancedApp.measure();
    loadBalancedApp.printResults();
}

benchmark();
