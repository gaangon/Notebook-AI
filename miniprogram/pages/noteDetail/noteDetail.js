// pages/noteDetail/noteDetail.js
Page({
  data: {
    title: '',
    创建日期: '',
    具体内容: '',
    _local: false,
    richContent: []   // rich-text 需要的 nodes
  },

  onLoad: function (options) {
    let note = null;
    // 优先从参数解析完整数据
    if (options.data) {
      try {
        note = JSON.parse(decodeURIComponent(options.data));
      } catch (e) { /* ignore */ }
    }
    // 回退：从本地存储按标题查找
    if (!note && options.title) {
      const title = decodeURIComponent(options.title || '');
      const list = wx.getStorageSync('localNotes') || [];
      note = list.find(n => n['标题'] === title);
      // 若仍找不到，尝试在云端数据里（页面级变量）搜索
      if (!note) {
        const app = getApp();
        const cloud = app.globalData && app.globalData.cloudNotes;
        if (cloud) {
          note = cloud.find(n => n['标题'] === title);
        }
      }
    }

    if (note) {
      const richContent = this.mdToHtml(note['具体内容'] || '');
      this.setData({
        ...note,
        richContent
      });
      wx.setNavigationBarTitle({ title: note['标题'] || '笔记详情' });
    } else {
      wx.showToast({ title: '笔记不存在', icon: 'none' });
    }
  },

  // ======== 简易 Markdown → HTML（rich-text 可渲染）======
  mdToHtml: function (md) {
    if (!md) return [];
    let html = md
      // 标题
      .replace(/^### (.+)$/gm, '<h3 style="font-size:30rpx;margin:20rpx 0 10rpx;">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-size:34rpx;margin:24rpx 0 12rpx;">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="font-size:38rpx;margin:28rpx 0 14rpx;">$1</h1>')
      // 加粗
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // 行内代码
      .replace(/`(.+?)`/g, '<code style="background:#f0f0f0;padding:2rpx 8rpx;border-radius:6rpx;font-size:24rpx;">$1</code>')
      // 代码块
      .replace(/```[\s\S]*?```/g, m => '<pre style="background:#1e1e1e;color:#d4d4d4;padding:20rpx;border-radius:12rpx;overflow:auto;font-size:24rpx;">' + m.replace(/```/g, '').replace(/</g, '<').replace(/>/g, '>') + '</pre>')
      // 无序列表
      .replace(/^- (.+)$/gm, '<li style="margin:6rpx 0 6rpx 20rpx;">$1</li>')
      // 有序列表
      .replace(/^\d+\. (.+)$/gm, '<li style="margin:6rpx 0 6rpx 20rpx;">$1</li>')
      // 引用块
      .replace(/^> (.+)$/gm, '<blockquote style="border-left:6rpx solid #1aad19;padding:8rpx 20rpx;margin:12rpx 0;color:#555;">$1</blockquote>')
      // 链接
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#1aad19;">$1</a>')
      // 段落（连续两个换行）
      .replace(/\n\n/g, '<br/><br/>');

    return [{
      name: 'div',
      attrs: {
        style: 'font-size:28rpx;line-height:1.8;color:#333;padding:20rpx 0;'
      },
      children: [{ type: 'text', text: html }]
    }];
  }
});
