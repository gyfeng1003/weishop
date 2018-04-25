var SearchBar = require('../../../../template/SearchBar/SearchBar.js')
const api = require('../../../../api/api.js')
var timer
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchFlag: true,
    loadError: false,
    loading: true,
    articleId: '',
    searchParam: '',
    pagination: {
      offset: 0,
      limit: 6
    },
    page: 1,
    pages: 0
  },
  bindInput: function(e){
    this.setData({
      searchParam: e.detail.value.trim()
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.articleId!==''){
      this.setData({
        articleId: options.articleId
      })
    }
    this.findAllGoods(1, true, this.data.searchParam)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    SearchBar.init(this)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 显示顶部刷新图标  
    wx.showNavigationBarLoading();
    this.setData({
      products: []
    })
    this.findAllGoods(1, true, this.data.searchParam)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.page != this.data.pages){
      this.findAllGoods(this.data.page + 1, false)
    }
  },
  findAllGoods: function(pageNo, override, goodsName){
    var pagination = this.data.pagination
    this.data.pagination = {
      offset: (pageNo - 1) * pagination.limit,
      limit: pagination.limit
    }
    this.setData({
      pagination: this.data.pagination
    })
    var userCode = wx.getStorageSync('userInfo').userCode
    api.request(api.findAllGoods, {
      goodsName,
      userCode,
      ...this.data.pagination
    }).then(res=>{
      var products = res.tList || []
      this.data.searchFlag = true
      if (products.length == 0) {
        this.data.searchFlag = false
        this.data.pages = this.data.page
      }else{
        this.data.page = pageNo
      }

      //商品列表中过滤掉已关联的商品
      var relateProduct = wx.getStorageSync('relateGoods')
      relateProduct = relateProduct? relateProduct:[] 
      try{
        wx.removeStorageSync('relateGoods')
      }catch(e){}
      relateProduct.forEach((item, index)=>{
        products.forEach((data, i)=>{
          if (item.goodsId == data.goodsId){
            products.splice(i, 1)
          }
        })
      })
      this.setData({
        products: override ? products : this.data.products.concat(products),
        searchFlag: this.data.searchFlag,
        loadError: false,
        loading: false,
        page: this.data.page,
        pages: this.data.pages
      })
    }).catch(error => {
      this.setData({
        loadError: true,
        loading: false
      })
    })
  },
  addOrRemoveWork: function (info, index) {
    api.request(api.addOrEditRelateGoods, info).then(res => {
      this.data.relatedProduct.splice(index, 1)
      this.setData({
        relatedProduct: this.data.relatedProduct
      })
    }).catch(err => {
      console.log(err)
    })
  },
  relateSubmit: function(){
    var products, selectedProducts;
    products = this.data.products
    selectedProducts = products.filter((curProduct) => {
      return curProduct.selected
    })
    if (this.data.articleId !== ''){
      var tempArr = this.buildRelatedInfo(selectedProducts)
      this.addOrRemoveWork(tempArr)
    }
   
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]  //上一个页面
    prevPage.data.relatedProduct.forEach(current => {
      selectedProducts.forEach((data,index)=>{
        if(current.goodsId == data.goodsId){
          selectedProducts.splice(index, 1)
        }
      })
    })
    if (this.data.articleId !== ''){
      selectedProducts.map(d=>(d.isDel = 0))
    }
    prevPage.setData({
      relatedProduct: prevPage.data.relatedProduct.concat(selectedProducts)
    })
    wx.navigateBack({
    })
  },
  buildRelatedInfo: function (products){
    var tempArr = []
    products.forEach((item, index)=>{
      tempArr.push({
        articleId: this.data.articleId,
        goodsId: item.goodsId,
        isDel: 0
      })
    })
    return tempArr
  },
  bindCheckbox: function (e) {
    let index = e.currentTarget.dataset.index
    this.data.products[index].selected = !this.data.products[index].selected
    this.setData({
      products: this.data.products
    })
  },
  onToProductDetail: function(e){
    wx.navigateTo({
      url: '/pages/productDetail/productDetail?goodsId=' + e.currentTarget.dataset.id,
    })
  },
  onSearchBarChangedEvent: function(e){
    this.data.searchFlag=true
    SearchBar.onSearchBarChangedEvent(e, this)

    if (e.detail.value.trim().length > 0) {
      try {
        clearTimeout(timer);
      } catch (e) {
        console.log(e);
      }
      timer = setTimeout(() => {
        this.findAllGoods(1, true, e.detail.value.trim())
      }, 600)
    } else {
      this.findAllGoods(1, true, this.data.searchParam)
    }
  },
  onSearchBarClearEvent: function (e) {
    SearchBar.onSearchBarClearEvent(e, this)
    this.findAllGoods(1, true, this.data.searchParam)
  }
})
