// pages/noteDetail/noteDetail.js
Page({
  data: {
    title: '',
    createDate: '',
    contentHtml: ''
  },

  onLoad() {
    const note = wx.getStorageSync('__current_note');
    if (!note) {
      wx.showToast({ title: '数据丢失', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }

    this.setData({
      title: note.title || '无标题',
      createDate: note.createDate || '',
      contentHtml: this.markdownToHtml(note.content || '')
    });
  },

  // 简易 Markdown → HTML（供 rich-text 使用）
  markdownToHtml(md) {
    if (!md) return '';

    let html = md
      // 代码块（优先处理，避免内部语法被再次替换）
      .replace(/```[\s\S]*?```/g, m => '<pre><code>' + m.replace(/```/g, '').trim() + '</code></pre>')
      // 标题
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // 加粗
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // 无序列表
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // 有序列表
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // 段落（连续两个换行）
      .replace(/\n\n/g, '<br/><br/>')
      // 单个换行
      .replace(/\n/g, '<br/>');

    return '<div class="md-content">' + html + '</div>';
  }
});
