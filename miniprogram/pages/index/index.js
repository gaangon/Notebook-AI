// pages/index/index.js
Page({
  data: {
    noteData: [],
    loading: true,
    error: null,
    expandedIdx: -1,
    useMock: false
  },

  onLoad: function () {
    this.fetchNoteData();
  },

  onPullDownRefresh: function () {
    this.fetchNoteData().then(() => wx.stopPullDownRefresh());
  },

  fetchNoteData: function () {
    this.setData({ loading: true, error: null });
    return new Promise((resolve) => {
      wx.cloud.callFunction({
        name: 'getNotesData',
        success: res => {
          const result = res.result || {};
          if (result.success && result.data) {
            this.setData({
              noteData: this.transformData(result.data),
              loading: false,
              useMock: false
            });
          } else {
            this.setData({ loading: false, useMock: true, error: result.error || null });
          }
          resolve();
        },
        fail: () => {
          this.setData({ loading: false, useMock: true });
          resolve();
        }
      });
    });
  },

  // 将 raw JSON 转为页面需要的格式
  transformData: function (raw) {
    return raw.map((day, i) => {
      const items = (day['条目'] || []).map(s => ({
        title: s['标题'] || '',
        desc: s['描述'] || '',
        score: s['评分'] || 0,
        scoreClass: this.scoreClass(s['评分'] || 0)
      }));
      const avg = items.reduce((sum, s) => sum + s.score, 0) / Math.max(items.length, 1);
      return {
        idx: i,
        date: day['日期'] || '',
        count: items.length,
        avgScore: (avg * 100).toFixed(1),
        avgScoreClass: this.scoreClass(avg),
        items: items
      };
    });
  },

  toggleExpand: function (e) {
    const idx = e.currentTarget.dataset.idx;
    this.setData({
      expandedIdx: this.data.expandedIdx === idx ? -1 : idx
    });
  },

  goNoteDetail: function (e) {
    const { title, desc } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/noteDetail/noteDetail?title=' + encodeURIComponent(title || '') + '&desc=' + encodeURIComponent(desc || '')
    });
  },

  scoreClass: function (score) {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }
});
