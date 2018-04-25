const api = require('../../api/api.js')
import { validateField } from '../../utils/validate.js'
const toastApi = require('../../template/ShowToast/showToast.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    mobile:''
  },
  sendDynamicCode: function(){
    var userCode = wx.getStorageSync('userInfo').userCode
    if (this.data.mobile.length != 11 || !/[\d]{11}/.test(this.data.mobile)){
      toastApi.showToast({
        title: '请输入11位数字的手机号码',
      })
      return
    }
    api.request(api.sendCaptchaCode, {
      userCode,
      mobile: this.data.mobile
    }).then(res=>{
      toastApi.showToast({
        title: '验证码已发送，请及时查收',
      })
    }).catch(err=>{
      console.log(err)
    })
  },
  bindInput: function(e){
    this.setData({
      mobile: e.detail.value
    })
  },
  bindMobile: function(e){
    var userCode = wx.getStorageSync('userInfo').userCode
    if (!validateField(e.detail.value, {
      mobile: [{
        type: 'required',
        message: '请输入您的手机号'
      }, {
        type: 'mobile',
        message: '请输入正确格式的手机号'
      }],
      capchaCode: {
        type: 'required',
        message: '请输入您收到的验证码'
      }
    }, this)){
      api.request(api.bindMobile, {
        userCode,
        mobile: e.detail.value.mobile,
        captchaCode: e.detail.value.capchaCode
      }, 'form').then(res => {
        wx.showToast({
          title: '绑定成功',
        })
        setTimeout(() => {
          wx.navigateBack({})
        }, 1000)
      }).catch(err => {
        console.log(err)
      })
    }else{
      toastApi.showToast({
        title: this.data.msg,
      })
    }
  }
})
