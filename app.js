//app.js
let api = require('/api/api.js')
let sessionKey = '', openId;
App({
  globalData: {
      userInfo: {}
  },
  onLaunch: function () {
    this.login()
  },
  login:function () {
    wx.login({
      success: res => {
        if (res.code) {
          api.request(api.getUserInfo, {tokenId: res.code+''}).then(res=>{
            sessionKey = res.entity.sessionKey
            openId = res.entity.openId
            this.getUserInfo()
          }).catch(err=>{
            console.log(err)
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
  getUserInfo: function(){
    wx.getUserInfo({
      success: res=>{
        var iv = res.iv,
        encryptedData = res.encryptedData
        // 下面开始调用获取授权信息接口
        api.request(api.checkToken, {
          encryptedData,
          iv,
          sessionKey,
          openId
        }).then(res=>{
          this.globalData.userInfo = res.entity
          // var userCode = 'Jbf3kFOlYCib3J1sxhjt2R'
          // res.entity.userCode = userCode
          wx.setStorageSync('userInfo', res.entity)
          this.globalData.uid = res.entity.userCode;
        }).catch(err=>{
          console.log(err)
        })
      }
    })
  }
})