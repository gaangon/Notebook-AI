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

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
    this.checkCanSubmit();
  },

  onContentInput(e) {
    const val = e.detail.value;
    if (val.length > MAX_CONTENT_LEN) {
      wx.showToast({ title: '最多1000字', icon: 'none' });
      return;
    }
    this.setData({ content: val });
    this.checkCanSubmit();
  },

  checkCanSubmit() {
    const { title, content } = this.data;
    this.setData({
      canSubmit: title.trim().length > 0 && content.trim().length > 0
    });
  },

  getNowDateStr() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    return y + '年' + m + '月' + d + '日';
  },

  // 保存按钮
  onSave() {
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
    setTimeout(() => { wx.navigateBack(); }, 800);
  },

  // 取消按钮
  onCancel() {
    wx.navigateBack();
  }
});
