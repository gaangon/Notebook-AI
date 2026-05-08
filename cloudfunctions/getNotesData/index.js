// cloudfunctions/getNotesData/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  try {
    const result = await cloud.downloadFile({
      fileID: 'cloud://wx-d8gxg26kyb6352e1a.7778-wx-d8gxg26kyb6352e1a-1257841065/notes.json'
    });

    if (!result.fileContent) {
      return { success: false, error: '文件内容为空' };
    }

    const text = result.fileContent.toString('utf-8');
    const data = JSON.parse(text);

    if (!Array.isArray(data)) {
      return { success: false, error: 'notes.json 格式错误，应为数组' };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
