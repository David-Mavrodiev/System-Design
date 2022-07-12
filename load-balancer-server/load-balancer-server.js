const LinearBalancerStrategyClass = require('./strategies/static/linear-balancer-strategy');
const AuthHelperClass = require('./utils/auth-helper');
const authHelper = new AuthHelperClass();

const httpProxy = require('http-proxy');
const apiProxy = httpProxy.createProxyServer();

const request = require('request');
const bodyParser = require('body-parser');

const PORT = 8080;
const HOST = '0.0.0.0';

const express = require('express');
const app = express();
const loadBalancerStrategy = new LinearBalancerStrategyClass();
 
// create application/json parser
var jsonParser = bodyParser.json()

app.get('/', (req, res) => {
  const workerAddress = loadBalancerStrategy.get();
  // apiProxy.web(req, res, {target: workerAddress});
  // res.redirect(workerAddress);

  req.pipe(request({ url: workerAddress + req.url })).pipe(res);
});

/**
 * Register worker by signed address.
 */
app.post('/register-worker', jsonParser, (req, res) => {
  const workerAddress = req.body.ipv4Address;
  const signature = req.body.signature;

  if (authHelper.verify(workerAddress, signature)) {
    console.info(`Register new worker: ${workerAddress}`);
    loadBalancerStrategy.add(workerAddress);
  } else {
    console.error(`Invalid worker tried to register: ${workerAddress}`);
  }

  res.status(200).send();
});

/**
 * Get the addresses of all of the workers registered.
 */
app.get('/workers', (req, res) => {
  res.send(loadBalancerStrategy.all());
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);