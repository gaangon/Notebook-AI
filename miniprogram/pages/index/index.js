// pages/index/index.js
const STORAGE_KEY = 'local_notes';
const MAX_LOCAL = 10;

Page({
  data: {
    noteList: [],
    loading: false,
    useMock: false
  },

  onLoad() {
    this.loadLocalNotes();
    this.fetchNoteData();
  },

  onShow() {
    this.loadLocalNotes();
    this.mergeNotes();
  },

  // 从本地存储加载用户自建笔记
  loadLocalNotes() {
    const local = wx.getStorageSync(STORAGE_KEY) || [];
    const tagged = local.map(item => ({
      ...item,
      _local: true,
      id: item.id || 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
    }));
    this._localNotes = tagged;
  },

  // 合并云端 + 本地，按创建日期倒序
  mergeNotes() {
    const cloud = this._cloudNotes || [];
    const local = this._localNotes || [];
    const all = [...cloud, ...local];

    all.sort((a, b) => {
      const da = a.createDate || '';
      const db = b.createDate || '';
      return db.localeCompare(da, 'zh-CN');
    });

    this.setData({ noteList: all });
  },

  // 从云函数获取笔记数据
  fetchNoteData() {
    this.setData({ loading: true, useMock: false });

    return new Promise((resolve) => {
      if (typeof wx.cloud === 'undefined') {
        this.useFallbackData(resolve);
        return;
      }

      wx.cloud.callFunction({
        name: 'getNotesData',
        success: res => {
          const result = res.result || {};
          if (result.success && result.data) {
            console.log('✅ 数据来源：云端');
            const cloudNotes = result.data.map((item, idx) => ({
              ...item,
              _local: false,
              id: 'cloud_' + idx + '_' + (item.title || '')
            }));
            this._cloudNotes = cloudNotes;
            this.mergeNotes();
            this.setData({ loading: false, useMock: false });
          } else {
            console.warn('⚠️ 云函数返回失败', result.error || '');
            this.useFallbackData(resolve);
          }
          resolve();
        },
        fail: (err) => {
          console.warn('❌ 云函数不可用', err);
          this.useFallbackData(resolve);
        }
      });
    });
  },

  // 兜底：使用本地 notes.json
  useFallbackData(resolve) {
    try {
      const notes = require('../../notes.json');
      const cloudNotes = (notes || []).map((item, idx) => ({
        ...item,
        _local: false,
        id: 'cloud_' + idx + '_' + (item.title || '')
      }));
      this._cloudNotes = cloudNotes;
      this.mergeNotes();
      this.setData({ loading: false, useMock: true });
    } catch (e) {
      this._cloudNotes = [];
      this.mergeNotes();
      this.setData({ loading: false, useMock: true });
    }
    if (resolve) resolve();
  },

  // 跳转到新建笔记页面
  goCreate() {
    wx.navigateTo({ url: '/pages/createNote/createNote' });
  },

  // 跳转到详情页
  goDetail(e) {
    const index = e.currentTarget.dataset.index;
    const note = this.data.noteList[index];
    if (!note) return;

    wx.setStorageSync('__current_note', note);
    wx.navigateTo({ url: '/pages/noteDetail/noteDetail' });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.fetchNoteData().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
