const api = require('../../../../api/api.js')
let SearchBar = require('../../../../template/SearchBar/SearchBar.js')
var timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      saveHidden: true,
      noSelect: true,
      products: [],
      loadError: false,
      loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    SearchBar.init(this)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.findAllGoods()
  },
  onSearchBarChangedEvent: function (e) {
    SearchBar.onSearchBarChangedEvent(e, this)
    if(e.detail.value.trim().length==0){
      this.findAllGoods()
    }
  },
  onSearchBarClearEvent: function (e) {
    SearchBar.onSearchBarClearEvent(e, this)
    this.findAllGoods()
  },
  resetTry: function(){
    this.findAllGoods()
  },
  onConfirm: function(e){
    if (e.detail.value.trim().length > 0) {
      this.findAllGoods(e.detail.value.trim())
    } else {
      this.findAllGoods()
    }
  },
  findAllGoods:function(value){
    var userCode = wx.getStorageSync('userInfo').userCode
    api.request(api.findAllGoods, {
      userCode,
      goodsName: value
    }).then(res=>{
      res.tList = res.tList||[]
      this.data.products = res.tList
      this.setData({
        products: this.data.products,
        searchFlag: true,
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
  editTap: function(){
    var list = this.data.products;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.selected = false;
    }
    this.setDataList(!this.getSaveHide(), this.noSelect(), list)
  },
  saveTap: function(){
    var list = this.data.products;
    this.setDataList(!this.getSaveHide(), this.noSelect(), list)
  },
  setDataList: function (saveHidden, noSelect, list){
    this.setData({
      saveHidden: saveHidden,
      noSelect: noSelect,
      products: list
    })
  },
  bindCheckbox:function(e){
    let index = e.currentTarget.dataset.index
    let list = this.data.products;
    this.data.products[index].selected = !this.data.products[index].selected
    this.setDataList(this.getSaveHide(), this.noSelect(), list);
  },
  onAddGoods: function (e) {
    SearchBar.onAddGoods(e, this, function(){})
  },
  editOrDelGoods: function(e){
    let type = e.currentTarget.dataset.type
    let goods = e.currentTarget.dataset.goods
    var goodsId = e.currentTarget.dataset.id
    if(type=='edit'){
      wx.navigateTo({
        url: '/pages/my/productManage/addOrEditProduct/addOrEditProduct?id=' + goodsId,
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '您确定要删除该商品吗？',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            goods.isDel = 1
            api.request(api.editOrDelGoods, goods)
            .then(res => {
              wx.showToast({
                title: '删除成功',
              })
              this.findAllGoods()
            }).catch(err => {
              wx.showToast({
                title: '删除失败',
              })
            })
          }
        }
      })
    }
  },
  deleteSelected: function(e){
    var list = this.data.products, delList = [];
    delList = list.filter(function(curGoods){
      return curGoods.selected;
    })
    api.request(api.editOrDelGoods, {

    }).then(res=>{

    }).catch(err=>{
      console.log(err)
    })
    list = list.filter(function (curGoods) {
      return !curGoods.selected;
    })
    this.setDataList(this.getSaveHide(), this.noSelect(), list);
  },
  getSaveHide: function () {
    var saveHidden = this.data.saveHidden;
    return saveHidden;
  },
  noSelect: function () {
    var list = this.data.products;
    var noSelect = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (!curItem.selected) {
        noSelect++;
      }
    }
    if (noSelect == list.length) {
      return true;
    } else {
      return false;
    }
  },
  onToProductDetail: function(e){
    let goodsId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/productDetail/productDetail?goodsId=' + goodsId,
    })
  }
})
