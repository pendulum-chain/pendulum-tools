#!/usr/bin/env node
var StellarSDK = require('stellar-sdk');

var address = process.argv[2];
let keypair;
if (StellarSDK.StrKey.isValidEd25519PublicKey(address)) {
	keypair = StellarSDK.Keypair.fromPublicKey(address);
} else if (address.startsWith('0x') && address.length === 66) {
	let pubKey = StellarSDK.StrKey.encodeEd25519PublicKey(Buffer.from(address.slice(2), 'hex'));
	keypair = StellarSDK.Keypair.fromPublicKey(pubKey);
} else {
	console.error("Invalid address format")
}

console.log("ED25519:", keypair.publicKey());	
console.log("hexa:", "0x" + keypair.rawPublicKey().toString('hex'));