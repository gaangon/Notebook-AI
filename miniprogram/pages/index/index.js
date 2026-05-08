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

  loadLocalNotes() {
    const local = wx.getStorageSync(STORAGE_KEY) || [];
    const tagged = local.map(item => ({
      ...item,
      _local: true,
      id: item.id || 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
    }));
    this._localNotes = tagged;
  },

  mergeNotes() {
    const cloud = (this._cloudNotes || []).filter(n => n && n.title);
    const local = (this._localNotes || []).filter(n => n && n.title);
    const all = [...cloud, ...local];

    all.sort((a, b) => {
      const da = a.createDate || '';
      const db = b.createDate || '';
      return db.localeCompare(da, 'zh-CN');
    });

    this.setData({ noteList: all });
  },

  fetchNoteData() {
    this.setData({ loading: true, useMock: false });

    return new Promise((resolve) => {
      if (typeof wx.cloud === 'undefined') {
        this.useFallbackData();
        resolve();
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
            this.useFallbackData();
          }
          resolve();
        },
        fail: (err) => {
          console.warn('❌ 云函数不可用', err);
          this.useFallbackData();
          resolve();
        }
      });
    });
  },

  useFallbackData() {
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
  },

  goCreate() {
    wx.navigateTo({ url: '/pages/createNote/createNote' });
  },

  goDetail(e) {
    const index = e.currentTarget.dataset.index;
    const note = this.data.noteList[index];
    if (!note) return;
    wx.setStorageSync('__current_note', note);
    wx.navigateTo({ url: '/pages/noteDetail/noteDetail' });
  },

  onPullDownRefresh() {
    this.fetchNoteData().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
