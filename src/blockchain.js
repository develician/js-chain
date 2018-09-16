const sha256 = require('sha256');
const EC = require('elliptic').ec;
const config = require('./config');
const wallet = require('./wallet');

class Blockchain {
    constructor() {
        this.pool = []
        this.chain = new Array();
        this.nodes = new Set(config.NODE_ADDRESSES);
    }

    genesis() {
        this.chain.push({
            index: 1,
            timestamp: Date.now(),
            transactions: [{
                sender: 'genesis',
                recipient: '0',
                amount: config.INITIAL_BALANCE
            }],
            nonce: 0,
            previous_hash: 0
        });

        return true;
    }

    lastBlock() {
        return this.chain.slice(-1)[0]
    }

    registerNode(address) {
        parsed_url = parse(address);
        this.nodes.push(parsed_url.host);
    }

    validChain(chain) {
        const lastBlock = chain[0];

        const currentIndex = 1;

        while(currentIndex < chain.length) {
            const block = chain[currentIndex];
            console.log(`c${lastBlock}`);
            console.log(`${block}`);
            console.log("\n------------\n");

            if (block['previous_hash'] != this.constructor.hash(lastBlock)) {
                return false;
            }

            if (!(this.constructor.validProof(lastBlock['nonce'], block['nonce']))) {
                return false
            }

            lastBlock = block
            currentIndex += 1
        }

        return true;
    }

    static hash(block) {
        /*
          @description
          Creates a SHA-256 hash of a Block
      
          : param block: Block
          */
    
        // We must make sure that the Object is Ordered, or we'll have inconsistent hashes
        const blockString = JSON.stringify(block, Object.keys(block).sort());
        return sha256(blockString);
    }

    resolveConflicts() {
        const neighbours = this.nodes;
        const newChain = null;

        const max_length = this.chain.length

        neighbours.forEach(function (node) {
            response = requests.get(`http://${node}/chain`)
                .on('response', function(res) {
                    if (res.statusCode == 200) {
                        var length = res.json()['length']
                        var chain = res.json()['chain']
            
                        // Check if the length is longer and the chain is valid
                        if (length > max_length && this.validChain(chain)) {
                          max_length = length
                          newChain = chain
                        }
                    }
                });
        });

        if(newChain) {
            this.chain = newChain;
            return true;
        }
        return false;
    }

    newBlock(nonce, previous_hash) {
        /* 
        @description
        Create a new Block in the Blockchain
        This is where the information is stored
    
        : param proof: The proof given by the Proof of Work algorithm
        : param previous_hash: Hash of previous Block
        : return: New Block
        */
    
        const block = {
          'index': this.chain == undefined ? 1 : this.chain.length + 1,
          'timestamp': Date.now(),
          'transactions': this.pool,
          'nonce': nonce,
          'previous_hash': previous_hash !== undefined ? previous_hash : 0,
    
        }
    
        this.pool = []
    
        this.chain.push(block)
    
        return block
    }

    newTransaction(sender, recipient, amount) {
        /* 
          @description
          Use eliptic curve keys to verify user's transaction
          source : https://github.com/indutny/elliptic
          then envoke a new transaction to go into the next mined Block's pool
      
          : param sender: Address of the Sender
          : param recipient: Address of the Recipient
          : param amount: Amount
          : return: The index of the Block that will hold this transaction
          */
    
        
        
    
    
        // create a new transaction to go into the next mined Block
        this.pool.push({
          'sender': sender,
          'recipient': recipient,
          'amount': amount,
        })
    
    
    
        return this.lastBlock()['index'] + 1
    }

    proofOfWork(lastNonce) {
        /*
        @description
        Simple Proof of Work Algorithm:
        - Find a nonce p', proof such that hash(pp') contains leading 4 zeroes, where p is the previous p'
        - p is the previous proof, and p' is the new proof
    
        : param lastNonce: Nonce from previous block in the blockchain
        */
    
        var nonce = 0
        while (this.constructor.validProof(lastNonce, nonce) == false) {
          nonce += 1
        }
    
        return nonce
    }

    static validProof(lastNonce, nonce) {
        /*
          @description
          Validates the Proof
      
          : param lastNonce: Nonce from previous block in the blockchain
          : param nonce: Current Nonce
          : return: True if correct, False if not.
          */
    
        const guess = sha256(`${lastNonce}${nonce}`)
        return guess.slice(0, config.DIFFICULTY) === "0".repeat(config.DIFFICULTY);
    }

    mineSelf() {
        /*
        @description
        Self-mining for the private blockchain(solo model)
        */
    
        // Get lastblock's nonce for mining
        var lastBlock = this.lastBlock();
        var lastNonce = lastBlock.nonce;
    
        var nonce = this.proofOfWork(lastNonce);
    
        // Forge the new Block by adding it to the chain
        var previousHash = this.constructor.hash(lastBlock);
        var block = this.newBlock(nonce, previousHash);
        console.log(this.chain);
    }
}

module.exports = Blockchain;