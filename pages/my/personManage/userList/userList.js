let api = require('../../../../api/api.js');
const SearchBar = require('../../../../template/SearchBar/SearchBar.js')
var timer
Page({

  /**
   * 页面的初始数据
   */
  data: {
    notEmployList: [],
    searchFlag: true,
    searchParam: '',
    loadError: false,
    loading: true,
    pagination: {
      offset: 0,
      limit: 6
    },
    page: 1,
    pages: 0
  },
  bindInput: function (e) {
    this.setData({
      searchParam: e.detail.value.trim()
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.listNotEmployee(1, true, this.data.searchParam)
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
    wx.showNavigationBarLoading();
    this.listNotEmployee(1, true, this.data.searchParam)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.page != this.data.pages) {
      this.listNotEmployee(this.data.page+1, false, this.data.searchParam)
    }
  },
  onSearchBarChangedEvent: function (e) {
    SearchBar.onSearchBarChangedEvent(e, this)
    this.setData({
      searchParam: e.detail.value.trim()
    })
    if (this.data.searchParam.length>0){
      try{
        clearTimeout(timer)
      }catch(e){}
      setTimeout(()=>{
        this.listNotEmployee(1, true, this.data.searchParam)
      }, 600)
    }else{
      this.listNotEmployee(1, true, this.data.searchParam)
    }
  },
  onSearchBarClearEvent: function (e) {
    SearchBar.onSearchBarClearEvent(e, this)
    this.listNotEmployee(1, true, '')
  },
  toOrder: function(e){
    wx.navigateTo({
      url: '/pages/myOrder/myOrder',
    })
  },
  listNotEmployee: function(pageNo, overried, value){
    let userCode = wx.getStorageSync('userInfo').userCode
    var pagination = this.data.pagination
    this.data.pagination = {
      offset: (pageNo - 1) * pagination.limit,
      limit: pagination.limit
    }
    this.setData({
      pagination: this.data.pagination
    })

    api.request(api.listNotEmployee, {
      userCode: userCode,
      searchParam: value,
      ...this.data.pagination
    }).then(res => {
      var notEmployList = res.tList
      this.data.searchFlag = true
      if (notEmployList.length == 0){
        this.data.searchFlag = false
        this.data.pages = this.data.page
      }else{
        this.data.page = pageNo
      }
      
      this.setData({
        notEmployList: overried ? notEmployList : this.data.notEmployList.concat(notEmployList),
        searchFlag: this.data.searchFlag,
        page: this.data.page,
        pages: this.data.pages,
        loadError: false,
        loading: false
      })
    }).catch(err => {
      this.setData({
        loadError: true,
        loading: false
      })
    })
  },
  setToEmployee: function(e){
    //确定要设置？
    wx.showModal({
      title: '提示',
      content: '您确定要将该用户设置位项目合伙人？',
      showCancel: false,
      success: res=>{
        if(res.confirm){
          let userCode = wx.getStorageSync('userInfo').userCode
          api.request(api.setEmployee, {
            userCode
          }).then(res => {
            wx.showToast({
              title: '设置成功'
            })
            this.listNotEmployee()
          }).catch(err => {
            console.log(err)
          })
        }
      }
    })
  }
})

