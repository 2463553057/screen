const fs = require('fs');
const path = require('path');

// 打印当前工作目录
console.log('当前工作目录:', process.cwd());

// 列出根目录内容
try {
  const rootFiles = fs.readdirSync(process.cwd());
  console.log('根目录内容:', rootFiles);
  
  // 检查app目录是否存在
  const appPath = path.join(process.cwd(), 'app');
  if (fs.existsSync(appPath)) {
    const appFiles = fs.readdirSync(appPath);
    console.log('app目录内容:', appFiles);
  } else {
    console.log('app目录不存在!');
  }
} catch (err) {
  console.error('读取目录错误:', err);
}

// 这个文件只是用于调试，不需要导出任何内容
module.exports = {}; 