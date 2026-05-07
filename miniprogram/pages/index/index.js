// pages/index/index.js
const MOCK_DATA = [
  {
    "日期": "2026年5月7日",
    "股票": [
      { "代码": "600519", "名称": "贵州茅台", "胜率": 0.68 },
      { "代码": "000858", "名称": "五粮液", "胜率": 0.55 },
      { "代码": "601318", "名称": "中国平安", "胜率": 0.72 }
    ]
  },
  {
    "日期": "2026年5月6日",
    "股票": [
      { "代码": "600519", "名称": "贵州茅台", "胜率": 0.56 },
      { "代码": "300750", "名称": "宁德时代", "胜率": 0.49 },
      { "代码": "000858", "名称": "五粮液", "胜率": 0.61 }
    ]
  }
];

Page({
  data: {
    stockData: [],
    loading: true,
    error: null,
    expandedDate: '',
    useMock: false
  },

  onLoad: function () {
    this.fetchStockData();
  },

  onPullDownRefresh: function () {
    this.fetchStockData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  fetchStockData: function () {
    this.setData({ loading: true, error: null });

    return new Promise((resolve) => {
      wx.cloud.callFunction({
        name: 'getStocksData',
        data: {},
        success: res => {
          const result = res.result || {};
          if (result.success && result.data) {
            const stockData = this.processData(result.data);
            this.setData({ stockData, loading: false, useMock: false });
          } else {
            this.loadMockData();
          }
          resolve();
        },
        fail: () => {
          this.loadMockData();
          resolve();
        }
      });
    });
  },

  // 处理原始数据：计算样式类、平均胜率
  processData: function (rawData) {
    return rawData.map(day => {
      const stocks = day.股票.map(s => ({
        ...s,
        _class: this.getWinRateClass(s.胜率)
      }));
      const avg = stocks.reduce((sum, s) => sum + s.胜率, 0) / stocks.length;
      return {
        ...day,
        股票: stocks,
        _avgRate: (avg * 100).toFixed(1),
        _avgClass: this.getWinRateClass(avg)
      };
    });
  },

  loadMockData: function () {
    const stockData = this.processData(MOCK_DATA);
    this.setData({
      stockData,
      loading: false,
      useMock: true,
      error: null
    });
  },

  toggleExpand: function (e) {
    const date = e.currentTarget.dataset.date;
    this.setData({
      expandedDate: this.data.expandedDate === date ? '' : date
    });
  },

  getWinRateClass: function (rate) {
    if (rate >= 0.6) return 'high';
    if (rate >= 0.5) return 'medium';
    return 'low';
  }
});
