const {
    generateKeyPairSync,
    createSign,
    createVerify,
    createPrivateKey,
    createPublicKey
} = require('node:crypto');
const fs = require('fs');

module.exports = class AuthHelper {
    constructor() {
        this.keysDir = "./keys";
        this.authPubKeyFile = `${this.keysDir}/auth.pub`;
        this.authPrivKeyFile = `${this.keysDir}/auth.priv`;
    }

    getPublicKey() {
        if (!fs.existsSync(this.authPubKeyFile)) {
            this.saveNewPair();
        }

        return createPublicKey(fs.readFileSync(this.authPubKeyFile));
    }

    getPrivateKey() {
        if (!fs.existsSync(this.authPrivKeyFile)) {
            this.saveNewPair();
        }

        return createPrivateKey(fs.readFileSync(this.authPrivKeyFile));
    }

    sign(data) {
        const sign = createSign('SHA256');
        sign.write(data);
        sign.end();

        return sign.sign(this.getPrivateKey(), 'hex');
    }

    verify(data, signature) {
        const verify = createVerify('SHA256');
        verify.write(data);
        verify.end();

        return verify.verify(this.getPublicKey(), signature, 'hex');
    }

    saveNewPair() {
        const pair = this.generatePair();
        fs.writeFileSync(this.authPrivKeyFile, pair.privateKey.export({type: "pkcs8", format: "pem"}));
        fs.writeFileSync(this.authPubKeyFile, pair.publicKey.export({type: "spki", format: "pem"}));
    }

    generatePair() {
        const { privateKey, publicKey } = generateKeyPairSync('ec', {
            namedCurve: 'sect239k1'
        });

        return { privateKey, publicKey };
    }
};