// pages/noteDetail/noteDetail.js
Page({
  data: { title: '', createDate: '', contentHtml: '' },
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
      contentHtml: this.md2h(note.content || '')
    });
  },
  md2h(md) {
    if (!md) return '';
    let h = md;
    h = h.replace(/```[\s\S]*?```/g, function(m) {
      return '<pre class="md-pre"><code class="md-code">' + m.replace(/```/g, '').trim() + '</code></pre>';
    });
    h = h.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
    h = h.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>');
    h = h.replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>');
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
    h = h.replace(/^- (.+)$/gm, '<li class="md-li">$1</li>');
    h = h.replace(/^\d+\. (.+)$/gm, '<li class="md-li">$1</li>');
    h = h.replace(/\n\n/g, '</p><p class="md-p">');
    h = h.replace(/\n/g, '<br/>');
    return '<div class="md-content"><p class="md-p">' + h + '</p></div>';
  }
});