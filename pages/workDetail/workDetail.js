const api = require('../../api/api.js')
const WxParse = require('../../wxParse/wxParse.js')
Page({
  data: {
    autoplay: false,
    interval: 5000,
    duration: 1000,
    toggleInput: false,
    currentUser: '',
    imgheights: [],
    //默认  
    current: 0,
    pagination: {
      offset: 0,
      limit: 6
    },
    page: 1,
    pages: 0,
    ciList: []
  },
  onLoad: function(options){
    //只可以分享自己的作品
    var currentUser = wx.getStorageSync('userInfo')
    this.setData({
      currentUser,
      articleId: options.articleId
    })
   
    this.getWorksComment(1, true, options.articleId)
    this.getWorkDetail(options)
  },
  onReachBottom: function () {
    if (this.data.pages != this.data.page) {
      this.getWorksComment(this.data.page + 1, false, this.data.articleId)
    }
  },
  getWorksComment: function (pageNo, overried, articleId) {
    var pagination = this.data.pagination
    this.data.pagination = {
      offset: (pageNo - 1) * pagination.limit,
      limit: pagination.limit
    }
    this.setData({
      pagination: this.data.pagination
    })
    api.request(api.getWorksComment, {
      articleId,
      ...this.data.pagination
    }).then(res => {
      var ciList = res.tList
      
      if (ciList.length == 0) {
        this.data.pages = this.data.page
        this.data.page = pageNo-1
      }else{
        this.data.page = pageNo
      }
      this.setData({
        ciList: overried ? ciList : this.data.ciList.concat(ciList),
        page: this.data.page,
        pages: this.data.pages
      })
    }).catch(err => {
      console.log(err)
    })
  },
  /*加载swiper图片 */
  autoImage: function(e){
    var imageWidth = e.detail.width,
    imageHeight = e.detail.height,
    scale = imageWidth/imageHeight,
    autoWidth, autoHeight

    wx.getSystemInfo({
      success: function(res) {
        autoWidth = res.windowWidth
        autoHeight = res.windowHeight
      },
    })

    var imgheights = this.data.imgheights
    imgheights[e.currentTarget.dataset.index] = {
      width: autoWidth,
      height: autoWidth/scale
    }

    this.setData({
      imgheights
    })
  },
  onShareAppMessage: function () {
    var userCode = wx.getStorageSync('userInfo').userCode
    return {
      title: this.data.work.name,
      path: '/pages/workDetail/workDetail?articleId=' + this.data.work.articleId + '&articleCreateUser=' + this.data.work.userCode,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  getWorkDetail: function (param) {
    var userCode = wx.getStorageSync('userInfo').userCode
    api.request(api.one, {
      articleId: param.articleId,
      userCode,
      articleUserCode: param.articleCreateUser
    }).then(res => {
      this.data.work = res.entity
      res.entity.content = res.entity.content.replace(/&hc/g, '<br/>')
      WxParse.wxParse('content', 'html', res.entity.content, this, 5);
      this.setData({
        work: this.data.work
      })
    }).catch(err => {
      console.log('err:' + err)
    })
  },
  onToggleInput: function(e){
    this.data.toggleInput = true
    this.setData(this.data)
  },
  bindInput: function(e){
    this.setData({
      content: e.detail.value
    })
  },
  onPublish: function(e){
    var work = this.data.work
    var content = this.data.content
    if (!content || content.trim() == ''){
      return
    }
    api.request(api.publishComment + '/' + work.articleId,{
      userCode: wx.getStorageSync('userInfo').userCode,
      content
    })
    .then(res=>{
      wx.showToast({
        title: '发表成功',
        icon: 'success',
        duration: 2000
      })
      this.data.toggleInput = false
      this.setData({
        toggleInput: this.data.toggleInput,
      })
      this.getWorkDetail(work)
    }).catch(err=>{
      console.log(err)
    })
  },
  onToProductList: function(e){
    let articleId = e.currentTarget.dataset.articleid
    wx.navigateTo({
      url: '/pages/productList/productList?articleId=' + articleId
    })
  },
  onToEditWork: function(e){
    wx.navigateTo({
      url: '/pages/my/workManage/addOrEditWork/addOrEditWork',
    })
  },
  //事件处理函数
  swiperchange: function (e) {
    this.setData({
      current: e.detail.current
    })
  },
  toHome: function(e){
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})