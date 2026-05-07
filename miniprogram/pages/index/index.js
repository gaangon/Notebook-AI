// pages/index/index.js
Page({
  data: {
    stockData: [],   // [{日期, 股票: [{代码, 胜率, _class}]}]
    loading: true,
    error: null,
    expandedDate: ''  // 当前展开哪天
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
            // 预处理：给每只股票加上胜率样式类
            const stockData = result.data.map(day => ({
              ...day,
              股票: day.股票.map(s => ({
                ...s,
                _class: this.getWinRateClass(s.胜率)
              }))
            }));
            this.setData({ stockData, loading: false });
          } else {
            this.setData({
              loading: false,
              error: result.error || '获取数据失败'
            });
          }
          resolve();
        },
        fail: err => {
          this.setData({
            loading: false,
            error: '云函数调用失败，请确保已部署 getStocksData 云函数。错误：' + (err.errMsg || '')
          });
          resolve();
        }
      });
    });
  },

  toggleExpand: function (e) {
    const date = e.currentTarget.dataset.date;
    this.setData({
      expandedDate: this.data.expandedDate === date ? '' : date
    });
  },

  // 胜率 → 样式类
  getWinRateClass: function (rate) {
    if (rate >= 0.6) return 'high';
    if (rate >= 0.5) return 'medium';
    return 'low';
  }
});
