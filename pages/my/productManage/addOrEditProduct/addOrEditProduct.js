const api = require('../../../../api/api.js')
import {validateField} from '../../../../utils/validate.js'
import { formatTime, uniqueArrObj } from '../../../../utils/util.js'    
const toastApi = require('../../../../template/ShowToast/showToast.js')
const qiniuUploader = require('../../../../utils/qiniuUploader.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultColors: [
      { name: '黑色' }, { name: '白色' }, { name: '红色' }, { name: '灰色'}, 
      { name: '蓝色' }, { name: '绿色'}],
    defaultSizes: [
      { name: '165/80A' }, { name: '170/84A' }, { name: '175/88A' }, 
      { name: '180/92A' }, { name: '185/96A' }, { name: '190/100A' }],
    tempColorArr: [],
    tempSizeArr: [],
    customColor: '',
    customSize: '',
    imgSrc: [],
    productSpec: [],
    wechatma: [],
    goodsId: ''
  },
  clearPic: function(e){
    var index = e.currentTarget.dataset.index;
    var imgSrc = this.data.imgSrc
    if (imgSrc[index].imageId != undefined){
      imgSrc[index].isDel = 1;
    }
    imgSrc[index].isShow = false
    this.setData({
      imgSrc
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.isEdit === 'false' ? '创建商品' : '编辑商品'
    })

    if (options.isEdit === 'false'){
      for (var m = 0; m < 9; m++) {
        this.data.imgSrc.push({
          isShow: false,
          imageUrl: ''
        })
      }
    }else{
      this.setData({
        goodsId: options.id
      })
      this.lookGoodsDetail(options.id)
    }

    let res = wx.getSystemInfoSync()
    this.setData({
      clientWidth: res.windowWidth - 12,
      clientHeight: res.windowHeight,
      imgSrc: this.data.imgSrc
    })
  },
  lookGoodsDetail:function(goodsId){
    api.request(api.goodsOne, {
      goodsId
    }).then(res => {
      if (res.entity) {
        var goods = res.entity
        this.parseGoods(goods)
      }
    }).catch(err => {
      console.log(err)
    })
  },
  parseGoods: function(goods){
    var imgSrc = this.data.imgSrc
    for (var m = 0; m < goods.imgList.length; m++) {
      imgSrc.push({
        isShow: true,
        imageUrl: goods.imgList[m].imageUrl,
        isDel: 0,
        imageId: goods.imgList[m].imageId,
        timeStamp: goods.imgList[m].timeStamp
      })
    }
    for (var n = 0; n < 9 - goods.imgList.length; n++) {
      imgSrc.push({
        isShow: false,
        imageUrl: ''
      })
    }
    var colors=[],sizes=[]
    for (var i = 0; i < goods.gdList.length; i++){
      colors.push({ name: goods.gdList[i].color})
      sizes.push({ name: goods.gdList[i].size})
    }

    colors = uniqueArrObj(colors)
    sizes = uniqueArrObj(sizes)
    for(var r = 0; r < colors.length; r++){
      for (var j = 0; j < this.data.defaultColors.length; j++){
        if (colors.length>0 && colors[r].name == this.data.defaultColors[j].name) {
          this.data.defaultColors[j].selected = true
          colors.splice(r, 1)
        }
      }
    }
    for (var s = 0; s < sizes.length; s++) {
      for (var p = 0; p < this.data.defaultColors.length; p++) {
        if (sizes.length > 0 && sizes[s].name == this.data.defaultSizes[p].name) {
          this.data.defaultSizes[p].selected = true
          sizes.splice(s, 1)
        }
      }
    }
    
    this.setData({
      goods,
      imgSrc,
      defaultColors: this.data.defaultColors,
      defaultSizes:this.data.defaultSizes,
      tempColorArr: colors,
      tempSizeArr: sizes,
      productSpec: goods.gdList
    })
  },
  selectImage: function (e) {
    var index = e.currentTarget.dataset.sort;
    var that = this, imgSrc = this.data.imgSrc;
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        for (var key in tempFilePaths) {
          imgSrc[key].isShow = tempFilePaths[key] ? true : false;
          imgSrc[key].imageUrl = tempFilePaths[key];
        }
        that.setData({
          imgSrc: imgSrc
        })
      },
      fail: function (res) {
        console.log("调用失败", JSON.stringify(res));
      }
    })
  },
  uploadImage: function (file) {
    return new Promise((resolve, reject)=>{
      var wechatma = this.data.wechatma, tempObj = {}
      qiniuUploader.upload(file.imageUrl, (res) => {
        tempObj = {
          imageUrl: res.error!=undefined? file.imageUrl : res.imageURL,
          timeStamp: formatTime(new Date())
        }
        if (file.imageId){
          tempObj.isDel = file.isDel
          tempObj.imageId = file.imageId
        }
        wechatma.push(tempObj)
        this.setData({
          wechatma: wechatma
        })
        resolve();
      }, (error) => {
        console.log('error: ' + error);
      }, {
          region: 'ECN',
          uptokenURL: api.baseUrl + '/v1/image/imageToken'   // 由其他程序生成七牛 uptoken
      })
    })
    
  },
  onToggleItem: function(e){
    let index = e.currentTarget.dataset.index
    let key = e.currentTarget.dataset.key

    if(key == 'color'){
      this.data.defaultColors[index].selected = !this.data.defaultColors[index].selected
      this.setData({
        defaultColors: this.data.defaultColors
      })
    }
    if (key == 'customcolor') {
      this.data.tempColorArr[index].selected = !this.data.tempColorArr[index].selected
      this.setData({
        tempColorArr: this.data.tempColorArr
      })
    }
    
    if (key == 'size') {
      this.data.defaultSizes[index].selected = !this.data.defaultSizes[index].selected
      this.setData({
        defaultSizes: this.data.defaultSizes
      })
    }
    if (key == 'customsize') {
      this.data.tempSizeArr[index].selected = !this.data.tempSizeArr[index].selected
      this.setData({
        tempSizeArr: this.data.tempSizeArr
      })
    }

    this.resetProductSpec()
  },
  resetProductSpec: function(){
    let defaultColors = this.data.defaultColors
    let tempColorArr = this.data.tempColorArr
    let defaultSizes = this.data.defaultSizes
    let tempSizeArr = this.data.tempSizeArr
    defaultColors = defaultColors.filter(function(curColor){
      return curColor.selected
    })
    tempColorArr = tempColorArr.filter(function (curColor) {
      return curColor.selected
    })
    defaultSizes = defaultSizes.filter(function (curSize) {
      return curSize.selected
    })
    tempSizeArr = tempSizeArr.filter(function (curSize) {
      return curSize.selected
    })
    var colors = defaultColors.concat(tempColorArr)
    var sizes = defaultSizes.concat(tempSizeArr)
    var productSpec = []
    if(colors.length>0 && sizes.length>0){
      for(var i=0; i<colors.length; i++){
        for(var j=0; j<sizes.length; j++){
          productSpec.push({
            size: sizes[j].name,
            color: colors[i].name,
            inventory: '',
          })
        }
      }
    }
    this.setData({
      productSpec: productSpec
    })  
  },
  onConfirm: function(e){
    let key = e.currentTarget.dataset.key
    if (key == 'color') {
      this.data.tempColorArr.push({
        name: e.detail.value,
        selected: true
      })

      this.setData({
        tempColorArr: this.data.tempColorArr,
        customColor: ''
      })
    }
    if (key == 'size') {
      this.data.tempSizeArr.push({
        name: e.detail.value,
        selected: true
      })

      this.setData({
        tempSizeArr: this.data.tempSizeArr,
        customSize: ''
      })
    }
    this.resetProductSpec()
  },
  delProductSpec: function(e){
    let index = e.currentTarget.dataset.index
    var list = this.data.productSpec
  
    if (this.data.goodsId !== ''){
      wx.showModal({
        title: '提示',
        content: '您确定要删除该商品规格吗？',
        showCancel: false,
        success: res=>{
          list[index].isDel = 1
          api.request(api.delGoodsItem, list[index]).then(res => {
              wx.showToast({
                title: '删除成功',
              })
          }).catch(err => {
            console.log(err)
          })
        }
      })
    }

    list.splice(index, 1);
    this.setData({
      productSpec: list
    })
  },
  bindInput: function(e){
    let index = e.currentTarget.dataset.index
    let type = e.currentTarget.dataset.type
    var list = this.data.productSpec
    if(type == 'shoujia'){
      list[index].goodsPrice = e.detail.value
    }else if(type=='num'){
      list[index].inventory = e.detail.value
    } else if (type =='chengben'){
      list[index].goodsCost = e.detail.value
    }
    this.setData({
      productSpec: list
    })
  },
  bindSaveProduct: function(e){
    if (validateField(e.detail.value, {
      name: {
        type: 'required',
        message: '请输入商品名称'
      },
      brand: {
        type: 'required',
        message: '请输入商品品牌'
      },
      goodsDesc: {
        type: 'required',
        message: '请输入商品描述'
      }
    }, this)){
      toastApi.showToast({
        title: this.data.msg,
      })
    }else{
      var imgSrc = this.data.imgSrc, tempImgSrc=[],delImgSrc=[];
      imgSrc = imgSrc.filter(function(curImg){
        return (curImg.isShow) && curImg.imageUrl.indexOf('image.235shanghai.com')<0
      })
      tempImgSrc = this.data.imgSrc.filter(curImg=>{
        return curImg.isShow && curImg.imageUrl.indexOf('image.235shanghai.com') > 0
      })
      delImgSrc = this.data.imgSrc.filter(curImg => {
        return curImg.isDel == 1 && curImg.imageUrl != ''
      })
      if (imgSrc.length == 0 && tempImgSrc.length == 0){
        toastApi.showToast({
          title: '至少上传1张图片哦',
        })
        return
      }
      if (this.data.productSpec.length==0){
        toastApi.showToast({
          title: '请选择颜色和尺码',
        })
        return
      }


      wx.showLoading({
        title: '',
      })
      Promise.all(imgSrc.map((d) => this.uploadImage(d))).then(()=>{
        wx.hideLoading()
        let wechatma = this.data.wechatma
        wechatma = wechatma.concat(tempImgSrc).concat(delImgSrc)
        var goods = {
          name: e.detail.value.name,
          brand: e.detail.value.brand,
          picture: wechatma[0].imageUrl,
          goodsPrice: e.detail.value.goodsPrice,
          goodsCost: e.detail.value.goodsCost,
          goodsDesc: e.detail.value.goodsDesc,
          gdList: this.data.productSpec,
          imgList: wechatma,
          userCode: wx.getStorageSync('userInfo').userCode
        }
        if (this.data.goods) {
          goods.goodsId = this.data.goods.goodsId
        }
        var URL = this.data.goods ? api.editOrDelGoods:api.addProduct
        api.request(URL, goods, 'form').then(res => {
          wx.showToast({
            title: '保存成功',
          })
          setTimeout(() => {
            wx.navigateBack({})
          }, 1000)
        }).catch(err => {
          console.log(err)
        })
      })
    }
  }
})

