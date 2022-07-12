const express = require('express');
const axios = require('axios');
const NetworkHelperClass = require('../utils/network-helper');
const AuthHelperClass = require('../utils/auth-helper');

const app = express();

const PORT = 8080;
const HOST = '0.0.0.0';

var req_count = 0;

app.get('/', (req, res) => {
    setTimeout(() => {
        res.send(`Server: ${process.env.NAME}, Request count: ${++req_count}`);
    }, 1000);
});

app.listen(PORT, HOST, () => {
    // Send request to the load balancer server to register as a worker.
    const ipv4Address = `http://${new NetworkHelperClass().getNetworkInterfaces()["eth0"][0]}:8080`;
    const signature = new AuthHelperClass().sign(ipv4Address);

    axios.post(process.env.LOAD_BALANCER_REGISTER, {
        ipv4Address: ipv4Address,
        signature: signature
    })
    .then(function (response) {
        console.log(response);
    })
    .catch(function (error) {
        console.log(error);
    });
});
console.log(`Running on http://${HOST}:${PORT}`);