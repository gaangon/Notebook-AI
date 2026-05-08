// pages/index/index.js
Page({
  data: {
    noteList: [],   // 合并后的笔记列表（云端 + 本地）
    loading: true
  },

  onLoad: function () {
    this.loadLocalNotes();   // 先加载本地
    this.fetchNoteData();   // 再拉取云端
  },

  onShow: function () {
    // 从新建页面返回时刷新本地笔记
    this.loadLocalNotes();
    this.mergeNotes();
  },

  // ========== 云端数据 ==========
  fetchNoteData: function () {
    this.setData({ loading: true });
    wx.cloud.callFunction({
      name: 'getNotesData',
      success: res => {
        const result = res.result || {};
        if (result.success && result.data) {
          const cloudNotes = result.data.map(item => ({
            ...item,
            _local: false,
            _id: 'c_' + (item.标题 || '') + '_' + (item.创建日期 || '')
          }));
          this.setData({ _cloudNotes: cloudNotes, loading: false });
          this.mergeNotes();
        } else {
          this.setData({ loading: false });
          this.mergeNotes();
        }
      },
      fail: () => {
        this.setData({ loading: false });
        this.mergeNotes();
      }
    });
  },

  // ========== 本地笔记 ==========
  loadLocalNotes: function () {
    const local = wx.getStorageSync('localNotes') || [];
    this.setData({ _localNotes: local });
  },

  // ========== 合并排序 ==========
  mergeNotes: function () {
    const cloud = this.data._cloudNotes || [];
    const local = this.data._localNotes || [];
    const merged = [].concat(cloud).concat(local);

    // 按创建日期倒序
    merged.sort((a, b) => {
      const da = new Date(a.创建日期 || 0);
      const db = new Date(b.创建日期 || 0);
      return db - da;
    });

    this.setData({ noteList: merged });
  },

  // ========== 跳转 ==========
  goDetail: function (e) {
    const idx = e.currentTarget.dataset.index;
    const note = this.data.noteList[idx];
    wx.navigateTo({
      url: '/pages/noteDetail/noteDetail?data=' + encodeURIComponent(JSON.stringify(note))
    });
  },

  goCreate: function () {
    const local = wx.getStorageSync('localNotes') || [];
    if (local.length >= 10) {
      wx.showToast({ title: '最多只能创建10条本地笔记', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/createNote/createNote' });
  }
});
