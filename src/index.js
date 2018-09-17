const express = require('express');
const parse = require('url-parse');
const sha256 = require('sha256');

const requests = require('request');

const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const Blockchain = require('./blockchain');

const Regulator = require('./regulator');

function uuid4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    });
}

node_identifier = uuid4();

blockChain = new Blockchain();
blockChain.genesis();

regulator = new Regulator();

app.get('/mine', (req, res) => {
    let lastBlock = blockChain.lastBlock();
    let lastNonce = lastBlock.nonce;

    let nonce = blockChain.proofOfWork(lastNonce);

    blockChain.newTransaction(
        sender = "0",
        recipient = node_identifier,
        amount = 1
    );

    previousHash = blockChain.constructor.hash(blockChain.lastBlock());

    block = blockChain.newBlock(nonce, previousHash);

    response = {
        'message': "New Block Forged",
        'index': block['index'],
        'transactions': block['transactions'],
        'nonce': block['nonce'],
        'previous_hash': block['previous_hash'],
    };
    
    res.status(200).json(response);
});

app.post('/transactions/new', (req, res) => {
    const values = req.body;

    console.log(values);

    const keys = Object.keys(values);

    console.log(keys);

    const required = ['sender', 'recipient', 'amount', 'signature', 'public_key'];

    if(keys.toString() !== required.toString()) {
        res.status(400).send("missing values!");
    }
 
    if(!regulator.identify(values, values.signature, values.public_key)) {
        res.status(400).send("Malicious transaction detected; Signature does not match your identity");
    }

    const index = blockChain.newTransaction(values['sender'], values['recipient'], values['amount']);

    let neighbors = this.nodes;

    neighbors.forEach((node) => {
        requests.post(`http://${node}/transactions/new`).form({'sender': values['sender'], 'recipient' : values['recipient'], 'amount' : values['amount']});
    });

    response = {'message': `Transaction will be added to Block ${index}`};

    res.status(201).json(response);
});


app.get('/chain', (req, res) => {
    response = {
        'chain': blockChain.chain,
        'length': blockChain.chain.length
    };

    res.status(200).json(response);
});

app.post('/nodes/register', (req, res) => {
    const values = req.body;

    const nodes = values['nodes'];

    if(nodes === null) {
        res.status(400).send("Error: Please supply a valid list of nodes");
    }

    nodes.forEach((node) => {
        blockChain.registerNode(node);
    });

    response = {
        'message': "New nodes have been added",
        'total_nodes': Array(blockChain.nodes)
    }
    
    res.status(201).json(response)
});

app.get('/nodes/resolve', (req, res) => {
    const replaced = blockChain.resolveConflicts();

    if(replaced) {
        response = {
            'message': "Our chain was replaced",
            'new_chain': blockChain.chain
        };
    } else {
        response = {
            'message': "Our chain is authoritative",
            'new_chain': blockChain.chain
        };
    }

    res.status(200).json(response);

});

app.get('/wallet/generate', (req, res) => {
    let wallet = regulator.initWalletw();
    const response = Object.assign({},wallet,{'message' : 'New wallet has been generated!'});

    res.status(200).json(response);
});

app.listen(4000, () => {
    console.log('!! block chain app is running on port', 4000, '!!');
});
