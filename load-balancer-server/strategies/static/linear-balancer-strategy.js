module.exports = class LinearBalancerStrategy {
    constructor() {
        this.order = 0;
        this.servers = [];
        this.register = {};
    }

    add(serverAddress) {
        if (this.register[serverAddress]) {
            return false;
        }

        this.register[serverAddress] = true;
        this.servers.push(serverAddress);
        return true;
    }

    get() {
        if (this.order >= this.servers.length) {
            this.order = 0;
        }

        return this.servers[this.order++];
    }

    all() {
        return this.servers;
    }
};