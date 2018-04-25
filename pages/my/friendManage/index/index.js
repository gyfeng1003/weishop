let api = require('../../../../api/api.js');
const SearchBar = require('../../../../template/SearchBar/SearchBar.js')
var timer
Page({

  /**
   * 页面的初始数据
   */
  data: {
    friends: [],
    loadError: false,
    loading: true,
    searchFlag: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAllFriends('')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    SearchBar.init(this)
  },
  onSearchBarChangedEvent: function (e) {
    SearchBar.onSearchBarChangedEvent(e, this)
    this.data.searchFlag = true
    if(e.detail.value.trim().length > 0){
      try {
        clearTimeout(timer)
      } catch (e) {}
      setTimeout(() => {
        this.getAllFriends(e.detail.value.trim())
      }, 600)
    }else{
      this.getAllFriends('')
    }
  },
  onSearchBarClearEvent: function (e) {
    SearchBar.onSearchBarClearEvent(e, this)
    this.getAllFriends('')
  },
  getAllFriends: function (searchParam) {
    let userCode = wx.getStorageSync('userInfo').userCode

    api.request(api.findfriendEmployee, {
      userCode: userCode,
      searchParam
    }).then(res => {
      var friends = res.tList
      if (friends.length == 0){
        this.data.searchFlag = false
      }
      this.setData({
        friends: friends,
        loadError: false,
        loading: false,
        searchFlag: this.data.searchFlag
      })
    }).catch(err => {
      this.setData({
        loadError: true,
        loading: false
      })
    })
  },
  lookWork: function(e){
    let userCode = e.currentTarget.dataset.user
    wx.setStorageSync('userCode', userCode)
    wx.switchTab({
      url: '/pages/index/index?userCode=' + userCode,
    })
  }
})
