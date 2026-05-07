// pages/stockDetail/stockDetail.js
Page({
  data: {
    code: '',          // 股票代码
    name: '',          // 股票名称
    history: [],       // 历史记录 [{idx, date, rate, _class}]
    avgRate: 0,       // 平均胜率
    avgClass: '',      // 平均胜率样式
    recommendCount: 0  // 被推荐次数
  },

  onLoad: function (options) {
    const { code, name } = options;
    if (!code) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }
    this.setData({ code: code || '', name: name || '' });
    this.loadHistory(code);
  },

  loadHistory: function (code) {
    wx.showLoading({ title: '加载中...' });

    wx.cloud.callFunction({
      name: 'getStocksData',
      success: res => {
        wx.hideLoading();
        const result = res.result || {};
        if (result.success && result.data) {
          this.processHistory(result.data, code);
        } else {
          this.loadLocalHistory(code);
        }
      },
      fail: () => {
        wx.hideLoading();
        this.loadLocalHistory(code);
      }
    });
  },

  // 处理历史数据：从所有日期中找出该股票的所有记录
  processHistory: function (allData, code) {
    const rawHistory = [];
    allData.forEach(day => {
      const stocks = day['股票'] || [];
      const found = stocks.find(s => s['代码'] === code);
      if (found) {
        rawHistory.push({
          date: day['日期'],
          rate: found['胜率']
        });
      }
    });

    // 按日期倒序（最新的在前面）
    rawHistory.sort((a, b) => {
      const da = this._parseDate(a.date);
      const db = this._parseDate(b.date);
      return db - da;
    });

    // 预处理：计算样式值（WXML 不支持 style 中的复杂运算）
    const history = rawHistory.map((item, i) => ({
      idx: i,
      date: item.date,
      rate: (item.rate * 100).toFixed(1),
      _class: this._getWinRateClass(item.rate)
    }));

    const avg = history.length > 0
      ? rawHistory.reduce((sum, h) => sum + h.rate, 0) / rawHistory.length
      : 0;

    this.setData({
      history,
      avgRate: (avg * 100).toFixed(1),
      avgClass: this._getWinRateClass(avg),
      recommendCount: history.length
    });

    wx.setNavigationBarTitle({
      title: this.data.name ? `${code} ${this.data.name}` : code
    });
  },

  // 加载本地 mock 历史数据（兜底）
  loadLocalHistory: function (code) {
    const MOCK_ALL = [
      { "日期": "2026年5月7日", "股票": [{ "代码": "600519", "名称": "贵州茅台", "胜率": 0.68 }, { "代码": "000858", "名称": "五粮液", "胜率": 0.55 }] },
      { "日期": "2026年5月6日", "股票": [{ "代码": "600519", "名称": "贵州茅台", "胜率": 0.56 }, { "代码": "300750", "名称": "宁德时代", "胜率": 0.49 }] },
      { "日期": "2026年5月5日", "股票": [{ "代码": "600519", "名称": "贵州茅台", "胜率": 0.72 }] }
    ];
    this.processHistory(MOCK_ALL, code);
  },

  _parseDate: function (str) {
    const cleaned = String(str).replace('年', '-').replace('月', '-').replace('日', '');
    return new Date(cleaned).getTime() || 0;
  },

  _getWinRateClass: function (rate) {
    if (rate >= 0.6) return 'high';
    if (rate >= 0.5) return 'medium';
    return 'low';
  }
});
