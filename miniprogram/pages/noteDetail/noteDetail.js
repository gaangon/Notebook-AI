// pages/noteDetail/noteDetail.js
Page({
  data: {
    title: '',        // 笔记标题
    desc: '',         // 笔记描述
    history: [],      // 历史记录 [{idx, date, score, scoreClass}]
    avgScore: 0,     // 平均评分
    avgScoreClass: '',// 平均评分样式
    totalCount: 0     // 记录次数
  },

  onLoad: function (options) {
    const { title, desc } = options;
    if (!title) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }
    this.setData({ title: decodeURIComponent(title || ''), desc: decodeURIComponent(desc || '') });
    this.loadHistory(this.data.title);
  },

  loadHistory: function (title) {
    wx.showLoading({ title: '加载中...' });

    wx.cloud.callFunction({
      name: 'getNotesData',
      success: res => {
        wx.hideLoading();
        const result = res.result || {};
        if (result.success && result.data) {
          this.processHistory(result.data, title);
        } else {
          this.loadLocalHistory(title);
        }
      },
      fail: () => {
        wx.hideLoading();
        this.loadLocalHistory(title);
      }
    });
  },

  // 从所有日期中找出该笔记的所有记录
  processHistory: function (allData, title) {
    const rawHistory = [];
    allData.forEach(day => {
      const items = day['条目'] || [];
      const found = items.find(s => s['标题'] === title);
      if (found) {
        rawHistory.push({
          date: day['日期'],
          score: found['评分']
        });
      }
    });

    rawHistory.sort((a, b) => {
      const da = this._parseDate(a.date);
      const db = this._parseDate(b.date);
      return db - da;
    });

    const history = rawHistory.map((item, i) => ({
      idx: i,
      date: item.date,
      score: (item.score * 100).toFixed(1),
      scoreClass: this._getScoreClass(item.score)
    }));

    const avg = history.length > 0
      ? rawHistory.reduce((sum, h) => sum + h.score, 0) / rawHistory.length
      : 0;

    this.setData({
      history,
      avgScore: (avg * 100).toFixed(1),
      avgScoreClass: this._getScoreClass(avg),
      totalCount: history.length
    });

    wx.setNavigationBarTitle({ title: this.data.title });
  },

  loadLocalHistory: function (title) {
    const MOCK_ALL = [
      { "日期": "2026年5月7日", "条目": [{ "标题": "项目启动会议纪要", "评分": 0.85 }, { "标题": "读书笔记：原子习惯", "评分": 0.72 }] },
      { "日期": "2026年5月6日", "条目": [{ "标题": "项目启动会议纪要", "评分": 0.78 }, { "标题": "晨间日记", "评分": 0.55 }] },
      { "日期": "2026年5月5日", "条目": [{ "标题": "项目启动会议纪要", "评分": 0.90 }, { "标题": "产品需求梳理", "评分": 0.68 }] }
    ];
    this.processHistory(MOCK_ALL, title);
  },

  _parseDate: function (str) {
    const cleaned = String(str).replace('年', '-').replace('月', '-').replace('日', '');
    return new Date(cleaned).getTime() || 0;
  },

  _getScoreClass: function (score) {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }
});
