let api = require('../../../../api/api.js');
const SearchBar = require('../../../../template/SearchBar/SearchBar.js')
var timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    employList: [],
    searchFlag: true,
    loadError: false,
    roleType: '',
    searchParam: '',
    pagination: {
      offset: 0,
      limit: 10
    },
    page: 1,
    pages: 0
  },
  bindInput: function(e){
    this.setData({
      searchParam: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    SearchBar.init(this)
    this.getAllEmployee(1, true, '')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getAllEmployee(1, true, this.data.searchParam)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.pages != this.data.page){
      this.getAllEmployee(this.data.page + 1, false, this.data.searchParam)
    }
  },
  onSearchBarChangedEvent: function (e) {
    SearchBar.onSearchBarChangedEvent(e, this)
    this.setData({
      searchParam: e.detail.value.trim()
    })
    if (this.data.searchParam.length>0){
      try {
        clearTimeout(timer);
      } catch (e) {
        console.log(e);
      }
      timer = setTimeout(() => {
        this.getAllEmployee(1, true, this.data.searchParam)
      }, 600)
    }else{
      this.getAllEmployee(1, true, this.data.searchParam)
    }
  },
  onSearchBarClearEvent: function (e) {
    SearchBar.onSearchBarClearEvent(e, this)
    this.getAllEmployee(1, true, '')
  },
  toOrder: function(e){
    let userCode = e.currentTarget.dataset.user
    wx.navigateTo({
      url: '/pages/myOrder/myOrder?userCode=' + userCode,
    })
  },
  onToAll: function(e){
    wx.navigateTo({
      url: '/pages/my/personManage/userList/userList',
    })
  },
  getAllEmployee: function(pageNo, overried, value){
    var userCode = wx.getStorageSync('userInfo').userCode;
    var roleType = wx.getStorageSync('userInfo').roleType;
    var URL=''
    if (roleType == 2){
      URL = api.findMyFans
    }else if (roleType == 1){
      URL = api.allEmployee
    }else{
      return
    }
    /*分页参数*/
    var pagination = this.data.pagination
    this.data.pagination = {
      offset: (pageNo - 1) * pagination.limit,
      limit: pagination.limit
    }
    this.setData({
      pagination: this.data.pagination
    })
    api.request(URL, {
      userCode,
      searchParam: value,
      ...this.data.pagination
    }).then(res=>{
      let employList = res.tList
      
      this.data.searchFlag = true
      if (employList.length == 0) {
        this.data.searchFlag = false
        this.data.pages = this.data.page
      }else{
        this.data.page = pageNo
      }
      this.setData({
        employList: overried ? employList : this.data.employList.concat(employList),
        searchFlag: this.data.searchFlag,
        roleType,
        loadError: false,
        pages: this.data.pages,
        page: this.data.page
      })
    }).catch(err=>{
       this.setData({
         roleType,
         loadError: true
       })
    })
  },
  cancel: function (e) {
    alertApi.hideAlert();
  }
})

