// const CryptoJS = require('./crypto-js.js');
//https://cdn.bootcss.com/crypto-js/3.1.9-1/crypto-js.js

const { reverse } = require('dns');
const CryptoJS = require('./crypto-js.min.js');
const { resourceUsage } = require('process');
//https://cdn.bootcss.com/crypto-js/3.1.9-1/crypto-js.min.js

function encrypt(content, password) {
    var raw = content
    var key = CryptoJS.enc.Hex.parse(CryptoJS.SHA512(password).toString());
    var iv = CryptoJS.enc.Hex.parse(CryptoJS.MD5(password).toString())

    var encrypt = CryptoJS.AES.encrypt(JSON.stringify(raw), key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypt.toString();
}

function decrypt(content, password) {
    var key = CryptoJS.enc.Hex.parse(CryptoJS.SHA512(password).toString());
    var iv = CryptoJS.enc.Hex.parse(CryptoJS.MD5(password).toString())

    var decrypt = CryptoJS.AES.decrypt(content, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    try {
        var data = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
    } catch (error) {
        return null;
    }
    //解密后的数据
    return data;
}

function generateKey(length = 64) {
    const characters = 'abcdef0123456789';
    const charactersLength = characters.length;
    let result = '';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters[randomIndex];
    }
    
    return result;
}


function updateKey(key, salt){
    return CryptoJS.SHA256(key + salt).toString();
}

function generateKeyChain(length, root = generateKey()){
    const result = [];
    let a = CryptoJS.enc.Hex.parse(root);
    for(let i = 0; i < length; i++){
        result.push(a.toString())
        a = CryptoJS.SHA256(a);
    }
    return result.reverse();
}

//会解密chain的一个前缀
function chainDecrypt(chain, key){
    let result = [];

    for (let i = chain.length - 1; i >= 0; i--) {
        let dec = decrypt(chain[i], key);
        if(dec !== null){
            result.push(dec);
            key = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(key)).toString();
        }
    }
    return result.reverse();
}

function chainEncrypt(data_chain, root){
    let key_chain = generateKeyChain(data_chain.length, root);

    let result = [];
    for(let i = 0; i < data_chain.length; i++){
        result.push(encrypt(data_chain[i], key_chain[i]))
    }

    return result;
}

module.exports = { encrypt, decrypt, generateKey, generateKeyChain, chainDecrypt, chainEncrypt, updateKey};


