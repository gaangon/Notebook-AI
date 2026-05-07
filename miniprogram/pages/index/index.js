// pages/index/index.js
Page({
  data: {
    stockData: [],
    loading: true,
    error: null,
    expandedIdx: -1,  // -1 表示全部折叠
    useMock: false
  },

  onLoad: function () {
    this.fetchStockData();
  },

  onPullDownRefresh: function () {
    this.fetchStockData().then(() => wx.stopPullDownRefresh());
  },

  fetchStockData: function () {
    this.setData({ loading: true, error: null });
    return new Promise((resolve) => {
      wx.cloud.callFunction({
        name: 'getStocksData',
        success: res => {
          const result = res.result || {};
          if (result.success && result.data) {
            this.setData({
              stockData: this.transformData(result.data),
              loading: false,
              useMock: false
            });
          } else {
            this.setData({ loading: false, useMock: true });
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
      const stocks = (day.股票 || []).map(s => ({
        code: s.代码 || '',
        name: s.名称 || '',
        rate: s.胜率 || 0,
        rateClass: this.rateClass(s.胜率 || 0)
      }));
      const avg = stocks.reduce((sum, s) => sum + s.rate, 0) / Math.max(stocks.length, 1);
      return {
        idx: i,
        date: day.日期 || '',
        count: stocks.length,
        avgRate: (avg * 100).toFixed(1),
        avgClass: this.rateClass(avg),
        stocks: stocks
      };
    });
  },

  toggleExpand: function (e) {
    const idx = e.currentTarget.dataset.idx;
    this.setData({
      expandedIdx: this.data.expandedIdx === idx ? -1 : idx
    });
  },

  goDetail: function (e) {
    const { code, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/stockDetail/stockDetail?code=' + code + '&name=' + (name || '')
    });
  },

  rateClass: function (rate) {
    if (rate >= 0.6) return 'high';
    if (rate >= 0.5) return 'medium';
    return 'low';
  }
});
