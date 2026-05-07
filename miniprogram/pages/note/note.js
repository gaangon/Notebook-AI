Page({
  data: {
    noteContent: '',
    showStock: false,
    stockDate: '',
    stockList: []
  },

  onLoad: function() {
    const noteContent = wx.getStorageSync('note_content');
    if (noteContent) {
      this.setData({ noteContent });
    }
  },

  onInput: function(e) {
    const value = e.detail.value;
    this.setData({ noteContent: value });
    wx.setStorageSync('note_content', value);
  },

  onRefresh: function() {
    wx.showLoading({ title: '加载中...' });

    // 调用云函数获取 stocks.json
    wx.cloud.callFunction({
      name: 'getStocksData',
      success: res => {
        wx.hideLoading();
        if (!res.result || !res.result.success) {
          wx.showToast({ title: res.result?.error || '加载失败', icon: 'none' });
          return;
        }

        const rawData = res.result.data;
        if (!rawData || rawData.length === 0) {
          wx.showToast({ title: '暂无数据', icon: 'none' });
          return;
        }

        // 按日期排序，取最新一日
        rawData.sort((a, b) => {
          const pa = this._parseDate(a['日期']);
          const pb = this._parseDate(b['日期']);
          return pb - pa;
        });

        const latest = rawData[0];
        const rawStocks = latest['股票'] || [];

        // 预处理：在 JS 中计算样式值（WXML 不支持运算和三元表达式）
        const stockList = rawStocks.map(item => ({
          code: item['代码'] || '',
          rate: (item['胜率'] * 100).toFixed(0) + '%',
          _barWidth: (item['胜率'] * 100) + '%',
          _barColor: item['胜率'] >= 0.6 ? '#52C41A' : (item['胜率'] >= 0.5 ? '#FA8C16' : '#FF4D4F')
        }));

        this.setData({
          showStock: true,
          stockDate: latest['日期'] || '',
          stockList
        });
      },
      fail: err => {
        wx.hideLoading();
        console.error('云函数调用失败', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // 辅助：解析中文日期为时间戳
  _parseDate: function(dateStr) {
    const cleaned = dateStr.replace('年', '-').replace('月', '-').replace('日', '');
    return new Date(cleaned).getTime() || 0;
  }
});
