const api = require('../../api/api.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo
    })
  },
  getPhoneNumber: function(e){
    wx.navigateTo({
      url: '/pages/modifyMobile/modifyMobile',
    })
  },
  onFunctionMenu: function(e){
    let key = e.currentTarget.dataset.key

    switch(key){
      case "order": 
        setTimeout(()=>{
          wx.navigateTo({
            url: '/pages/myOrder/myOrder?source=manage',
          })
        }, 500)
        break;
      case "address":
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/address/addressList/addressList',
          })
        }, 500)
        break;
      case "work":
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/my/workManage/workManage',
          })
        }, 500)
        break;
      case "goods":
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/my/productManage/index/index',
          })
        }, 500)
        break;
      case "person":
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/my/personManage/index/index',
          })
        }, 500)
        break;
      case "friend":
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/my/friendManage/index/index',
          })
        }, 500)
        break;
    }
  }
})
