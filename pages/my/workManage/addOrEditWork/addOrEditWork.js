import {validateField} from '../../../../utils/validate.js'
import {formatTime} from '../../../../utils/util.js'
const toastApi = require('../../../../template/ShowToast/showToast.js')
const qiniuUploader = require('../../../../utils/qiniuUploader.js')
const api = require('../../../../api/api.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    products: [],
    relatedProduct: [],
    imgSrc: [],
    wechatma: []
  },
  clearPic: function (e) {
    var index = e.currentTarget.dataset.index;
    var imgSrc = this.data.imgSrc
    if (imgSrc[index].imageId != undefined) {
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
      title: options.isEdit == 'false' ?'创建作品': '编辑作品'
    })

    if(options.isEdit == 'false'){
      for (var m = 0; m < 9; m++) {
        this.data.imgSrc.push({
          isShow: false,
          imageUrl: ''
        })
      }
    }else{
      this.lookWorkDetail(options.id)
    }

    let res = wx.getSystemInfoSync()
    this.setData({
      clientWidth: res.windowWidth - 12,
      clientHeight: res.windowHeight,
      imgSrc: this.data.imgSrc
    })
  },
  lookWorkDetail: function(id){
    api.request(api.one, {
      articleId: id
    }).then(res => {
      var work = res.entity
      work.content = work.content.split('&hc').join('\n');
      this.parseWork(work)
    }).catch(err => {
      console.log('err:' + err)
    })
  },
  parseWork: function(work){
    var imgSrc = this.data.imgSrc
    for (var m = 0; m < work.imgList.length; m++) {
      imgSrc.push({
        isShow: true,
        imageUrl: work.imgList[m].imageUrl,
        isDel: 0,
        imageId: work.imgList[m].imageId,
        timeStamp: work.imgList[m].timeStamp
      })
    }
    for (var n = 0; n < 9 - work.imgList.length; n++) {
      imgSrc.push({
        isShow: false,
        imageUrl: ''
      })
    }
    this.setData({
      work,
      relatedProduct: work.giList,
      imgSrc
    })
  },
  removeGoods: function(e){
    let index = e.currentTarget.dataset.index
    let relatedProduct = this.data.relatedProduct
    if(this.data.work){
      var info = {
        articleId: this.data.work.articleId,
        goodsId: relatedProduct[index].goodsId,
        name: relatedProduct[index].name,
        isDel: 1
      }
      this.addOrRemoveWork([info], index)
    }else{
      relatedProduct.splice(index, 1)
    }
    this.setData({
      relatedProduct
    })
  },
  addOrRemoveWork: function(info, index){
    wx.showModal({
      title: '提示',
      content: '您确定要删除关联的'+info[0].name+'商品吗？',
      showCancel: false,
      success: res=>{
        api.request(api.addOrEditRelateGoods, info).then(res => {
          wx.showToast({
            title: '删除成功',
          })
          this.data.relatedProduct.splice(index, 1)
          this.setData({
            relatedProduct: this.data.relatedProduct
          })
        }).catch(err => {
          console.log(err)
        })
      }
    })
  },
  selectImage: function(e){
    var index = e.currentTarget.dataset.sort;
    var that = this, imgSrc = this.data.imgSrc;
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        for (var key in tempFilePaths){
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
  uploadImage: function(file){
    return new Promise((resolve, reject)=>{
      var wechatma = this.data.wechatma, tempObj = {}
      qiniuUploader.upload(file.imageUrl, (res) => {
        tempObj.imageUrl = res.error != undefined ? file.imageUrl : res.imageURL,
        tempObj.timeStamp = formatTime(new Date())
        if (file.imageId) {
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
  onRelateProduct: function (e) {
    wx.setStorageSync('relateGoods', this.data.relatedProduct)
    var articleId='';
    if (this.data.work) {
      articleId = this.data.work.articleId
    }
    wx.navigateTo({
      url: '/pages/my/workManage/relateProduct/relateProduct?articleId=' + articleId
    })
  },
  onToProductDetail: function (e) {
    let goodsId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/productDetail/productDetail?goodsId=' + goodsId,
    })
  },
  bindSaveWork: function(e){
    if (validateField(e.detail.value, {
      title: {
        type: 'required',
        message: '请输入作品标题'
      },
      content: {
        type: 'required',
        message: '请输入作品描述'
      }
    }, this)) {
      toastApi.showToast({
        title: this.data.msg,
      })
    } else {
      let imgSrc = this.data.imgSrc, tempImgSrc = [], delImgSrc=[];
      imgSrc = imgSrc.filter(function (curImg) {
        return curImg.isShow && curImg.imageUrl.indexOf('image.235shanghai.com') < 0
      })
      tempImgSrc = this.data.imgSrc.filter(curImg => {
        return curImg.isShow && curImg.imageUrl.indexOf('image.235shanghai.com') > 0
      })
      delImgSrc = this.data.imgSrc.filter(curImg => {
        return curImg.isDel == 1 && curImg.imageUrl != ''
      })
      
      if (imgSrc.length == 0 && tempImgSrc.length == 0) {
        toastApi.showToast({
          title: '至少上传1张图片哦',
        })
        return
      }

      wx.showLoading({
        title: '',
        mask: true
      })
      Promise.all(imgSrc.map((d) => this.uploadImage(d))).then(()=>{
        wx.hideLoading()
        let wechatma = this.data.wechatma
        wechatma = wechatma.concat(tempImgSrc).concat(delImgSrc)
        var work = {
          title: e.detail.value.title,
          content: e.detail.value.content.split('\n').join('&hc'),
          imgList: wechatma,
          picture: wechatma[0].imageUrl.indexOf('image.235shanghai.com') < 0 ? 'http://image.235shanghai.com' + wechatma[0].imageUrl : wechatma[0].imageUrl,
          agrList: this.data.relatedProduct,
          userCode: wx.getStorageSync('userInfo').userCode
        }
        if (this.data.work) {
          work.articleId = this.data.work.articleId
        }
        var URL = this.data.work ? api.editOrDelWork : api.addWork
        api.request(URL, work, 'form').then(res => {
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
