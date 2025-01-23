
const CryptoJS = require('./crypto-js.min.js');
const {encrypt, decrypt, generateKey, chainEncrypt, chainDecrypt, generateKeyChain} = require('./mycipher.js');
const {raw_puzzles} = require('./raw_puzzles.js');

const decipher_keys = new Map();
var next_cipher_id = 1;

const frontend_data = [];
const backend_data = [];

function make_cipher(raw_data, price, type, key = generateKey()){
    const cipher_id = next_cipher_id++;
    const cipher_data = encrypt(raw_data, key);
    decipher_keys.set(cipher_id, [key, price, type, 1]);
    return {"decipher_id": cipher_id, "cipher" : [cipher_data]};
}

function make_chain_cipher(raw_data_chain, price, type, key = generateKey()){
    const cipher_id = next_cipher_id++;
    decipher_keys.set(cipher_id, [key, price, type, raw_data_chain.length]);
    return {"decipher_id": cipher_id, "cipher" : chainEncrypt(raw_data_chain, key)};
}


for (const puzzle of raw_puzzles){


    const contents = [];
    const answers = [];

    for(item of puzzle.content){
        contents.push(item[1]);
        if(item[0])
            answers.push(item[0]);
    }

    const root = generateKey();
    // const key_chain = generateKeyChain(contents.length, root);
    const expected_cipher_answer = answers.map((answer) => CryptoJS.SHA256(answer).toString());
    const other_cipher_answer_response = [];

    Object.entries(puzzle.toast).forEach(([answer, response]) => {
        other_cipher_answer_response.push([
            CryptoJS.SHA256(answer).toString(), 
            response
        ]);
    });


    const cipher_hints = [];
    for(item of puzzle.hints){
        cipher_hints.push({title: item.title, cipher: make_cipher(item.content, item.price, 1)})
    }

    const backend_value = {
        puzzle_id: puzzle.puzzle_id,
        title: puzzle.title,
        meta: puzzle.meta,
        bounty: puzzle.price,
        expected_cipher_answer: expected_cipher_answer,
        other_cipher_answer_response: other_cipher_answer_response
    };

    let meta = puzzle.meta ?  10: 0;
    let unlock_base = puzzle.meta ? 20250129 : puzzle.price;


    const frontend_value = {
        puzzle_id: puzzle.puzzle_id,
        title: puzzle.title,
        meta: puzzle.meta,
        skip: make_cipher(puzzle.content[puzzle.content.length -1][0], unlock_base, 2 + meta),
        content: make_chain_cipher(contents, puzzle.price, 0 + meta, root),
        hints: cipher_hints
    };

    backend_value.decipher_id = frontend_value.content.decipher_id;

    frontend_data.push(frontend_value);
    backend_data.push(backend_value);
    
}

const util = require('util');

// //这里的 frontend_data 是最终会包含在前端项目中的
// console.log(util.inspect(frontend_data, { depth: null, colors: true }));

// //这里的数据导出后供后端插入数据库
// console.log(util.inspect(backend_data, { depth: null, colors: true }));
// console.log(decipher_keys)

//检查解密情况：
function test_decipher(item){
    const key = decipher_keys.get(item.decipher_id)[0];
    console.log(chainDecrypt(item.cipher, key));
}

// for (const puzzle of frontend_data){
//     test_decipher(puzzle.content);
//     test_decipher(puzzle.skip);
//     for (const hint of puzzle.hints){
//         test_decipher(hint.cipher)
//     }
// }

const fs = require('fs');
fs.writeFileSync("output/frontend.json", JSON.stringify(frontend_data, null, 2));
fs.writeFileSync("output/backend.json", JSON.stringify(backend_data, null, 2));
fs.writeFileSync("output/cipher_key.json", JSON.stringify(Array.from(decipher_keys), null, 2));
