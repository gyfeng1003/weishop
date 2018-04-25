const api=require('../../../api/api.js')
const toastApi = require('../../../template/ShowToast/showToast.js')
import { validateField } from '../../../utils/validate.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.isEdit == 'false' ? '新增地址' : '编辑地址'
    })

    if (options.isEdit == 'false'){

    }else{
      var addrForm = wx.getStorageSync('consignee')
      if (addrForm) {
        this.data.region = [addrForm['province'], addrForm['city'], addrForm['area']];
        this.setData({
          region: this.data.region,
          addrForm: addrForm
        })
        try {
          wx.removeStorageSync('consignee')
        } catch (e) { }
      }
    }
  },
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },
  onSaveAddrInfo: function(e){
    if (!validateField(e.detail.value, {
      name: {
        type: 'required',
        message: '请输入您的姓名'
      },
      mobile: [{
        type: 'required',
        message: '请输入您的手机号'
      }, {
        type: 'mobile',
        message: '请输入正确格式的手机号'
      }],
      region: {
        type: () => {
          return !(this.data.region.length > 0)
        },
        message: '请选择所在地区'
      },
      content: {
        type: 'required',
        message: '请输入您的详细地址'
      }
    }, this)) {
      var addrObj = {
        name: e.detail.value.name,
        mobile: e.detail.value.mobile,
        province: e.detail.value.region[0],
        city: e.detail.value.region[1],
        area: e.detail.value.region[2],
        content: e.detail.value.content,
        userCode: wx.getStorageSync('userInfo').userCode
      }
      this.data.addrForm && (addrObj.consigneeId = this.data.addrForm.consigneeId)
      
      api.request(api.editOrDelAddr, addrObj, 'form').then(res => {
        wx.showToast({
          title: '保存成功'
        })
        setTimeout(()=>{
          wx.navigateBack({})
        }, 1000)
      }).catch(err => {
        console.log(err)
      })
    } else {
      toastApi.showToast({
        title: this.data.msg,
      })
    }
  }

})