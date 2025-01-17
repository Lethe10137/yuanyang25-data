const {chainEncrypt, chainDecrypt, generateKey, generateKeyChain} = require('./mycipher.js');


let root = generateKey();
let data = [1,2,3,4,5,6];


let key_chain = generateKeyChain(6, root);
console.log(key_chain);

let chain_encrypt = chainEncrypt(data, root);

for (const item of key_chain){
    console.log(item, chainDecrypt(chain_encrypt, item));
}
