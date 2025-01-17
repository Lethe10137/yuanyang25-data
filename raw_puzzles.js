
// 导入所需模块
const fs = require('fs');
const path = require('path');

// 定义文件路径
const rawPuzzlesPath = path.resolve(__dirname, 'raw_puzzles.json');

// 读取文件并解析为 JSON
let rawPuzzles;
try {
    const rawData = fs.readFileSync(rawPuzzlesPath, 'utf-8');
    rawPuzzles = JSON.parse(rawData);
} catch (error) {
    console.error('Error reading or parsing raw_puzzles.json:', error);
    process.exit(1);
}

// 导出常量
const raw_puzzles = rawPuzzles;

module.exports = { raw_puzzles };