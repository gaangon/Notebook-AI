// pages/createNote/createNote.js
const STORAGE_KEY = 'local_notes';
const MAX_LOCAL = 10;
const MAX_CONTENT_LEN = 1000;

Page({
  data: {
    title: '',
    content: '',
    canSubmit: false
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({
      title: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 内容输入
  onContentInput(e) {
    const val = e.detail.value;
    if (val.length > MAX_CONTENT_LEN) {
      wx.showToast({ title: '最多1000字', icon: 'none' });
      return;
    }
    this.setData({
      content: val
    });
    this.checkCanSubmit();
  },

  // 检查是否可提交
  checkCanSubmit() {
    const { title, content } = this.data;
    this.setData({
      canSubmit: title.trim().length > 0 && content.trim().length > 0
    });
  },

  // 获取当前日期字符串
  getNowDateStr() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    return y + '年' + m + '月' + d + '日';
  },

  // 提交
  onSubmit() {
    if (!this.data.canSubmit) return;

    const notes = wx.getStorageSync(STORAGE_KEY) || [];

    if (notes.length >= MAX_LOCAL) {
      wx.showToast({ title: '本地笔记最多10条', icon: 'none' });
      return;
    }

    const newNote = {
      id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: this.data.title.trim(),
      createDate: this.getNowDateStr(),
      content: this.data.content.trim()
    };

    notes.unshift(newNote);
    wx.setStorageSync(STORAGE_KEY, notes);

    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack();
    }, 800);
  },

  // 返回
  onBack() {
    wx.navigateBack();
  }
});
