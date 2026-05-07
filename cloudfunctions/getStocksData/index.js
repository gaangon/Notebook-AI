// cloudfunctions/getStocksData/index.js
const cloud = require('wx-server-sdk');
const https = require('https');
const http = require('http');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 辅助：通过 HTTP/HTTPS 获取 JSON
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON 解析失败')); }
      });
    }).on('error', reject);
  });
}

exports.main = async (event, context) => {
  try {
    // stocks.json 在云存储中的路径
    const filePath = 'stocks.json';

    // 获取临时下载链接
    const urlResult = await cloud.getTempFileURL({
      fileList: [filePath]
    });

    if (!urlResult.fileList || urlResult.fileList.length === 0) {
      return { success: false, error: '文件不存在，请先将 stocks.json 上传到云存储' };
    }

    const fileInfo = urlResult.fileList[0];
    if (!fileInfo.tempFileURL) {
      return { success: false, error: '无权限访问文件，请检查云存储安全规则' };
    }

    // 下载并解析 JSON
    const data = await fetchJson(fileInfo.tempFileURL);
    
    if (!Array.isArray(data)) {
      return { success: false, error: 'stocks.json 格式错误，应为数组' };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
