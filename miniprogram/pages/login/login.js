Page({
  onLogin: function() {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('登录成功', res)
        wx.redirectTo({
          url: '/pages/note/note'
        })
      },
      fail: err => {
        console.error('登录失败', err)
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        })
      }
    })
  }
})
