import {validateField} from '../../utils/validate';
const api=require('../../api/api.js');
const toastApi = require('../../template/ShowToast/showToast.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    addr: [],
    addrList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var shopList = [];
    //立即购买下单
    var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
    if (buyNowInfoMem) {
      shopList = buyNowInfoMem
    }
    this.data.goodsObj = shopList
    this.setData({
      goodsObj: this.data.goodsObj
    });
    this.getAddrList()
  },
  getAddrList: function(){
    var userCode = wx.getStorageSync('userInfo').userCode
    api.request(api.findAddrList, {
      userCode
    }).then(res => {
      this.data.addrList = res.tList
      if(res.tList.length > 0){
        this.data.addr = res.tList[0]
      }
      this.setData(this.data)
    }).catch(err => {
      console.log(err)
    })
  },
  bindRegionChange: function(e){
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
      },{
        type: 'mobile',
        message: '请输入正确格式的手机号'
      }],
      region:{
        type: ()=>{
          return !(this.data.region.length > 0)
        },
        message: '请选择所在地区'
      },
      content: {
        type: 'required',
        message: '请输入您的详细地址'
      }
    }, this)){
      var addrObj={
        name: e.detail.value.name,
        mobile: e.detail.value.mobile,
        province: e.detail.value.region[0],
        city: e.detail.value.region[1],
        area: e.detail.value.region[2],
        content: e.detail.value.content,
        userCode: wx.getStorageSync('userInfo').userCode
      }
      api.request(api.createAddr, addrObj).then(res=>{
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
        this.getAddrList()
      }).catch(err=>{
        console.log(err)
      })
    }else{  
      toastApi.showToast({
        title: this.data.msg,
      })
    }
  },
  onToAddrList: function(e){
    wx.navigateTo({
      url: '/pages/address/addressList/addressList?src=order',
    })
  },
  onSubmitOrder: function (e) {
    var postData = {}
    postData.articleCreateUser = this.data.goodsObj.createArticelUser
    postData.userCode = wx.getStorageSync('userInfo').userCode
    postData.remarks = this.data.remark
    postData.consigneeId = this.data.addr.consigneeId
    postData.orderGoodsRel = {
      goodsDetailId: this.data.goodsObj.goodsDetailId,
      count:1,
      goodsPrice: this.data.goodsObj.price
    }

    api.request(api.createOrder, postData).then(res=>{
      wx.showModal({
        title: '提示',
        content: '您确定要提交该订单吗?',
        showCancel: false,
        success: res=>{
          if(res.confirm){
            wx.showToast({
              title: '下单成功',
              duration: 2000  //不显示
            })
            // 下单成功，跳转到订单界面
            wx.redirectTo({
              url: '/pages/myOrder/myOrder',
            })
          }
        }
      })
    
    }).catch(err=>{
      console.log(err)
    })
  },
  changeInput:function(e){
    this.setData({
      remark: e.detail.value
    })
  }
})