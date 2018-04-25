const api = require('../../api/api.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods:[],
    loadError: false,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getArticleGoods(options.articleId)
  },
  onToProductDetail: function(e){
    let goodsId = e.currentTarget.dataset.goodsid
    let userCode = e.currentTarget.dataset.code
    wx.navigateTo({
      url: '/pages/productDetail/productDetail?goodsId=' + goodsId + "&userCode=" + userCode
    })
  },
  getArticleGoods: function (articleId){
    var sys = wx.getSystemInfoSync()
    
    api.request(api.articleGoods, {
      articleId
    }).then(res=>{
      this.data.goods = res.tList
      this.setData({
        goods: this.data.goods,
        clientWidth: sys.windowWidth,
        clientHeight: sys.windowHeight,
        loadError: false,
        loading: false
      })
    }).catch(err=>{
      this.setData({
        loadError: true,
        loading: false
      })
    })
  }

})