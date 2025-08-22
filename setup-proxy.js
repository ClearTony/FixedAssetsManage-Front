const os = require('os');
const fs = require('fs');
const path = require('path');

// 获取本机IP地址
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // 跳过内部地址和非IPv4地址
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

// 读取vue.config.js
const configPath = path.join(__dirname, 'vue.config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// 获取本机IP
const localIP = getLocalIP();
console.log(`检测到本机IP地址: ${localIP}`);

// 替换代理配置中的IP地址
const newTarget = `http://${localIP}:8081`;
configContent = configContent.replace(
  /target: 'http:\/\/[^']*:8081'/,
  `target: '${newTarget}'`
);

// 写回配置文件
fs.writeFileSync(configPath, configContent, 'utf8');
console.log(`已更新vue.config.js中的代理配置为: ${newTarget}`);
console.log('请重启开发服务器以使配置生效'); 