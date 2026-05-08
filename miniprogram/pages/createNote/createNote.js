// pages/createNote/createNote.js
Page({
  data: {
    title: '',
    content: ''
  },

  onTitleInput: function (e) {
    this.setData({ title: e.detail.value });
  },

  onContentInput: function (e) {
    if (e.detail.value.length <= 1000) {
      this.setData({ content: e.detail.value });
    }
  },

  onCancel: function () {
    wx.navigateBack();
  },

  onSave: function () {
    const { title, content } = this.data;
    if (!title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!content.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    const note = {
      _local: true,
      _id: 'l_' + Date.now(),
      '标题': title.trim(),
      '创建日期': this.formatDate(new Date()),
      '具体内容': content.trim()
    };

    const list = wx.getStorageSync('localNotes') || [];
    if (list.length >= 10) {
      wx.showToast({ title: '最多只能创建10条本地笔记', icon: 'none' });
      return;
    }
    list.unshift(note);
    wx.setStorageSync('localNotes', list);

    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 800);
  },

  formatDate: function (d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
});
