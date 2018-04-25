const api = require('../../api/api.js');
Page({
  data: {
    works:[],
    loadError: false,
    loading: true,
    pagination: {
      offset: 0,
      limit: 6
    },
    page: 1,
    pages: 0
  },
  onLoad: function (options) {
    var response = wx.getSystemInfoSync()
    this.setData({
      clientWidth: response.windowWidth,
      clientHeight: response.windowHeight,
    })
  },
  onShow: function(){
    this.resetTry(1, true)
  },
  // 下拉刷新 
  onPullDownRefresh: function(){
    // 显示顶部刷新图标  
    wx.showNavigationBarLoading();
    this.resetTry(1, true)
  },
  /** 
   * 页面上拉触底事件的处理函数 
   */
  onReachBottom: function () {
    if (this.data.page != this.data.pages){
      this.resetTry(this.data.page + 1)
    }
  },
  onFriendSearch: function (e) {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
  onWorkDetail: function(e){
    let articleId = e.currentTarget.dataset.articleid
    let userCode = e.currentTarget.dataset.user
    wx.navigateTo({
      url: '/pages/workDetail/workDetail?articleId=' + articleId + '&articleCreateUser=' + userCode
    })
  },
  findWorkByUser: function (userCode, pageNo, override){
    api.request(api.lookWorkByUserId, {
      userCode,
      ...this.data.pagination
    }).then(res=>{
      var works = res.tList
      if(works.length == 0){
        this.data.pages = this.data.page
      } else {
        this.data.page = pageNo
      }
      this.setData({
        page: this.data.page,
        pages: this.data.pages,
        works: override ? works : this.data.works.concat(works),
        loadError: false,
        loading: false
      })
    }).catch(err=>{
      this.setData({
        loadError: true,
        loading: false
      })
    })
  },
  getInfocenter: function (pageNo, override){
    var userCode = wx.getStorageSync('userInfo').userCode
    api.request(api.infocenter, {
      userCode,
      ...this.data.pagination
    }, 'list').then(res=>{
      var works = res.tList
      if (works.length == 0) {
        this.data.pages = this.data.page
      } else {
        this.data.page = pageNo
      }
      this.setData({
        page: this.data.page, 
        pages: this.data.pages,
        works: override ? works : this.data.works.concat(works),
        loadError: false,
        loading: false
      })
    }).catch(err=>{
      this.setData({
        loadError: true,
        loading: false
      })
    })
  },
  resetTry: function (pageNo, override){
    var pagination = this.data.pagination
    this.data.pagination={
      offset: (pageNo - 1) * pagination.limit,
      limit: pagination.limit
    }
    this.setData({
      pagination: this.data.pagination
    })

    var userCode = wx.getStorageSync('userCode')
    try {
      wx.removeStorageSync('userCode')
    } catch (e) { }

    if (userCode) {
      this.findWorkByUser(userCode, pageNo, override)
    } else {
      this.getInfocenter(pageNo, override)
    }
  }
})
