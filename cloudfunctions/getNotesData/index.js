// cloudfunctions/getNotesData/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  try {
    const result = await cloud.downloadFile({
      fileID: 'cloud://cloud1-d8gtbzcucb546ae4d.636c-cloud1-d8gtbzcucb546ae4d-1429254465/notes.json'
    });

    if (!result.fileContent) {
      return { success: false, error: '文件内容为空' };
    }

    const text = result.fileContent.toString('utf-8');
    const data = JSON.parse(text);

    if (!Array.isArray(data)) {
      return { success: false, error: 'notes.json 格式错误，应为数组' };
    }

    // 返回原始数据，前端自行处理
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
