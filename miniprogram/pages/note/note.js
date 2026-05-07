Page({
  data: {
    noteContent: '',
    showStock: false,
    stockDate: '',
    stockList: []
  },

  onLoad: function() {
    // 从本地存储恢复笔记内容
    const noteContent = wx.getStorageSync('note_content')
    if (noteContent) {
      this.setData({ noteContent })
    }
  },

  onInput: function(e) {
    const value = e.detail.value
    this.setData({ noteContent: value })
    // 实时保存到本地存储
    wx.setStorageSync('note_content', value)
  },

  onRefresh: function() {
    wx.showLoading({ title: '加载中...' })
    
    // 从云存储下载 stocks.json
    wx.cloud.downloadFile({
      fileID: 'cloud://wx-d8gxg26kyb6352e1a/stocks.json',
      success: res => {
        const filePath = res.tempFilePath
        // 读取文件内容
        const fs = wx.getFileSystemManager()
        fs.readFile({
          filePath: filePath,
          encoding: 'utf-8',
          success: fileRes => {
            try {
              const data = JSON.parse(fileRes.data)
              // 按日期排序，取最新一日
              data.sort((a, b) => {
                const dateA = new Date(a.日期.replace('年', '-').replace('月', '-').replace('日', ''))
                const dateB = new Date(b.日期.replace('年', '-').replace('月', '-').replace('日', ''))
                return dateB - dateA
              })
              const latest = data[0]
              this.setData({
                showStock: true,
                stockDate: latest.日期,
                stockList: latest.股票
              })
              wx.hideLoading()
            } catch (e) {
              console.error('解析 JSON 失败', e)
              wx.showToast({
                title: '数据格式错误',
                icon: 'none'
              })
              wx.hideLoading()
            }
          },
          fail: err => {
            console.error('读取文件失败', err)
            wx.showToast({
              title: '读取失败',
              icon: 'none'
            })
            wx.hideLoading()
          }
        })
      },
      fail: err => {
        console.error('下载文件失败', err)
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        })
        wx.hideLoading()
      }
    })
  }
})
