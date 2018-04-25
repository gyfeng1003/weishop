const api = require('../../api/api.js');
const WxParse = require('../../wxParse/wxParse.js');
const utils = require('../../utils/util.js');
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    autoplay: true,
    interval: 5000,
    duration: 1000,
    chooseSize: true,
    animation: {},
    hideShopPopup: true,
    //buyNumber: 0,
    //buyNumMin: 1,
    selectSize: '选择：',
    shopType: "tobuy",//购物类型，加入购物车或立即购买，默认为立即购买,
    pagination: {
      offset: 0,
      limit: 6
    },
    page: 1,
    pages: 0,
    ciList: []
  },
  swiperchange: function(e){
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  onLoad: function(option){
    this.setData({
      goodsId: option.goodsId 
    })
    this.getGoodsDetail(option.goodsId, option.userCode)
    this.getGoodsComment(1, true, option.goodsId)
  },
  onReachBottom: function(){
    if (this.data.pages != this.data.page) {
      this.getGoodsComment(this.data.page + 1, false, this.data.goodsId)
    }
  },
  getGoodsComment: function (pageNo, overried, goodsId){
    var pagination = this.data.pagination
    this.data.pagination = {
      offset: (pageNo - 1) * pagination.limit,
      limit: pagination.limit
    }
    this.setData({
      pagination: this.data.pagination
    })
    api.request(api.getGoodsComment, {
      goodsId,
      ...this.data.pagination
    }).then(res=>{
      var ciList = res.tList
      if(ciList.length == 0){
        this.data.pages = this.data.page
      }else{
        this.data.page = pageNo
      }
      this.setData({
        ciList: overried ? ciList : this.data.ciList.concat(ciList),
        page: this.data.page,
        pages: this.data.pages
      })
    }).catch(err=>{
      console.log(err)
    })
  },
  getDefaultSelectedProperty: function(){
    var childs, propertyChildNames = '', selectSizeTemp='', label='';
    var properties = this.data.goods.properties;
    
    for(var i=0; i<properties.length; i++){
      childs = this.data.goods.properties[i].childsCurGoods
      for(var j=0; j<childs.length; j++){
        if(childs[j].active){
          propertyChildNames += childs[j].name + "    ";
          label += childs[j].name + ','
        }
      }
      selectSizeTemp += " " + properties[i].name
    }
    
    this.setData({
      selectSize: this.data.selectSize + selectSizeTemp,
      propertyChildNames: propertyChildNames,
      label: label
    })
  },
  chooseSezi:function(e){
    //创建一个动画实例
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'linear' //匀速
    })

    this.animation = animation
    animation.translateY(200).step()

    this.setData({
      animationData: animation.export(),
      hideShopPopup: false
    })
    
    setTimeout(()=>{
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }, 200)
  },
  hideModal: function(e){
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear'
    })
    this.animation = animation
    animation.translateY(200).step()
    this.setData({
      animationData: animation.export()
    })

    setTimeout(()=>{
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        hideShopPopup: true
      })
    }, 200)
  },
  closePopupTap: function () { //规格选择弹出框隐藏
    this.setData({
      hideShopPopup: true
    })
  },
  labelItemTap: function(e){
    var that = this;
     // 取消该分类下的子栏目所有的选中状态
    var childs = this.data.goods.properties[e.currentTarget.dataset.propertyindex].childsCurGoods;
    for (var i = 0; i < childs.length; i++) {
      this.data.goods.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[i].active = false;
    }
    // 设置当前选中状态
    this.data.goods.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex].active = true;
  
    // 获取所有的选中规格尺寸数据
    var needSelectNum = that.data.goods.properties.length;
    var curSelectNum = 0;
    var propertyChildIds = "";
    var propertyChildNames = "";
    for (var i = 0; i < that.data.goods.properties.length; i++) {
      childs = that.data.goods.properties[i].childsCurGoods;
      for (var j = 0; j < childs.length; j++) {
        if (childs[j].active) {
          curSelectNum++;
          propertyChildNames += childs[j].name + "  ";
        }
      }
    }
    var canSubmit = false;
    if (needSelectNum == curSelectNum) {
      canSubmit = true;
    }
    this.data.propertyChildNames = propertyChildNames
    this.setData(this.data)
  },
  buyNow: function(e){
    this.chooseSezi(e)
  },
  onToConfirmOrder:function(e){
    //组建立即购买信息
    var buyNowInfo = this.bulidBuyNowInfo();
    // 写入本地存储
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })
    this.closePopupTap();

    wx.navigateTo({
      url: "/pages/confirmOrder/confirmOrder"
    })
  },
  bulidBuyNowInfo: function(){
    var shopCarMap={}
    shopCarMap.brand = this.data.goods.brand;
    shopCarMap.pic = this.data.goods.picture;
    shopCarMap.name = this.data.goods.name;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.goods.goodsCost;
    shopCarMap.articleUserName = this.data.goods.articleUserName
    shopCarMap.createArticelUser = this.data.goods.createArticleUser;
    
    let label = this.data.label;
    let gdList = this.data.goods.gdList;
    let arr = label.split(",")
    for (var i = 0; i < gdList.length; i++){
      if (gdList[i].size == arr[0] && gdList[i].color == arr[1]){
        shopCarMap.goodsDetailId = gdList[i].goodsDetailId
        return shopCarMap
      }
    }
    return shopCarMap
  },
  getGoodsDetail: function (goodsId, userCode){
    api.request(api.goodsOne, {
      goodsId,
      articleUserCode: userCode
    }).then(res=>{
      var goods = res.entity || {}
      goods.createArticleUser = userCode
      //商品介绍
      var content = '';
      if (goods.imgList){
        for (let i = 0; i < goods.imgList.length; i++) {
          content += '<p><img src="' + goods.imgList[i].imageUrl + '" style="" title="'
            + goods.imgList[i].imageUrl + '"/></p>'
        }
        
        WxParse.wxParse('article', 'html', content, this, 5);
      }

      this.setData({
        goods
      })
      //popup
      if (goods.gdList && goods.gdList.length>0){
        this.parseGdList(goods.gdList)
      }
    }).catch(err=>{
      console.log(err)
    })
  },
  parseGdList: function (gdList){
    var colorArr = [], sizeArr = [], sizes = [], colors = [], properties = []
    for (var i = 0; i < gdList.length; i++) {
      colorArr.push(gdList[i].color)
      sizeArr.push(gdList[i].size)
    }
    colorArr = utils.uninqueArr(colorArr)
    sizeArr = utils.uninqueArr(sizeArr)

    for (var m = 0; m < sizeArr.length; m++) {
      sizes.push({
        name: sizeArr[m]
      })
      sizes[0].active = true
    }
    for (var n = 0; n < colorArr.length; n++) {
      colors.push({
        name: colorArr[n]
      })
      colors[0].active = true
    }

    this.data.goods.properties = [{
      name: '尺码',
      childsCurGoods: sizes
    }, {
      name: '颜色',
      childsCurGoods: colors
    }]
    this.setData({
      goods: this.data.goods
    })
    //获取默认选中商品
    this.getDefaultSelectedProperty()
  },
  // numJianTap: function () {
  //   if (this.data.buyNumber > this.data.buyNumMin) {
  //     var currentNum = this.data.buyNumber;
  //     currentNum--;
  //     this.setData({
  //       buyNumber: currentNum
  //     })
  //   }
  // },
  // numJiaTap: function () {
  //   debugger
  //   if (this.data.buyNumber < this.data.buyNumMax) {
  //     var currentNum = this.data.buyNumber;
  //     currentNum++;
  //     this.setData({
  //       buyNumber: currentNum
  //     })
  //   }
  // }

})
