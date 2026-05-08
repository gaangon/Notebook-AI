// app.js - 纯本地模式，不依赖云环境
App({
  onLaunch: function () {
    // 云环境初始化（静默失败，不影响本地运行）
    if (typeof wx.cloud !== 'undefined' && wx.cloud) {
      try {
        wx.cloud.init({
          env: 'cloud1-d8gtbzcucb546ae4d',
          traceUser: false
        });
      } catch (e) {
        // 云环境不可用，页面将使用本地数据
      }
    }
  }
});
