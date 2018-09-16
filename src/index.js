const express = require('express');
const parse = require('url-parse');
const sha256 = require('sha256');

const requests = require('request');

const app = express();
const bodyParser = require('body-parser');

const Blockchain = require('./blockchain');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

blockChain = new Blockchain();
blockChain.genesis();



app.listen(4000, () => {
    console.log('!! block chain app is running on port', 4000, '!!');
});
