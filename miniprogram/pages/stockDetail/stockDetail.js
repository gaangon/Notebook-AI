// pages/stockDetail/stockDetail.js
Page({
  data: {
    code: '',          // 股票代码
    name: '',          // 股票名称
    history: [],       // 历史推荐记录 [{日期, 胜率, _class}]
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
      data: {},
      success: res => {
        wx.hideLoading();
        const result = res.result || {};
        if (result.success && result.data) {
          this.processHistory(result.data, code);
        } else {
          // 云函数失败，尝试从本地读取
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
    const history = [];
    allData.forEach(day => {
      const found = day.股票.find(s => s.代码 === code);
      if (found) {
        history.push({
          日期: day.日期,
          胜率: found.胜率,
          _class: this.getWinRateClass(found.胜率)
        });
      }
    });

    // 按日期倒序（最新的在前面）
    history.sort((a, b) => {
      const da = this.parseDate(a.日期);
      const db = this.parseDate(b.日期);
      return db - da;
    });

    const avg = history.length > 0
      ? history.reduce((sum, h) => sum + h.胜率, 0) / history.length
      : 0;

    this.setData({
      history,
      avgRate: (avg * 100).toFixed(1),
      avgClass: this.getWinRateClass(avg),
      recommendCount: history.length
    });

    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: this.data.name ? `${code} ${this.data.name}` : code
    });
  },

  // 加载本地 mock 历史数据（兜底）
  loadLocalHistory: function (code) {
    const MOCK_ALL = [
      {
        "日期": "2026年5月7日",
        "股票": [
          { "代码": "600519", "名称": "贵州茅台", "胜率": 0.68 },
          { "代码": "000858", "名称": "五粮液", "胜率": 0.55 }
        ]
      },
      {
        "日期": "2026年5月6日",
        "股票": [
          { "代码": "600519", "名称": "贵州茅台", "胜率": 0.56 },
          { "代码": "300750", "名称": "宁德时代", "胜率": 0.49 }
        ]
      },
      {
        "日期": "2026年5月5日",
        "股票": [
          { "代码": "600519", "名称": "贵州茅台", "胜率": 0.72 }
        ]
      }
    ];
    this.processHistory(MOCK_ALL, code);
  },

  // "2026年5月7日" -> Date 对象
  parseDate: function (str) {
    const m = str.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    return new Date(0);
  },

  getWinRateClass: function (rate) {
    if (rate >= 0.6) return 'high';
    if (rate >= 0.5) return 'medium';
    return 'low';
  }
});
