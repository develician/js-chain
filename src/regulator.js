const { INITIAL_BALANCE } = require('./config');
const Wallet = require('./wallet');
const { randomBytes } = require('crypto');
const secp256k1 = require('secp256k1');
const sha256 = require('sha256');
const createKeccakHash = require('keccak');

class Regulator {
    constructor() {
        this.users = 0;
        this.INITIAL_BALANCE = INITIAL_BALANCE;
    }

    initWallet() {
        this.users += 1;

        let privKey;
        do {
            privKey = randomBytes(32);
        } while(!secp256k1.privateKeyVerify(privKey));


        let pubKey = secp256k1.publicKeyCreate(privKey);

        let address = '0x' + createKeccakHash('keccak256').update(pubKey).digest('hex').slice(95,);

        let balance = 0;

        return new Wallet(address, privKey, pubKey, balance);

    }


    identify(data, sigObj, publicKey) {
        delete data.public_key;
        delete data.signature;
        
        return secp256k1.verify(data, sigObj.signature, publicKey);
    }
}

module.exports = Regulator;