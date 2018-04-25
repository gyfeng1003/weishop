const api = require('../../../api/api.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addrList: [],
    delBtnWidth: 100,    //删除按钮宽度单位（rpx）
    loadError: false,
    src: '',
    loading: true
  },
  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750 / 2) / (w / 2);  //以宽度750px设计稿做宽度的自适应
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
    }
  },
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.src == 'order'){
      this.setData({
        src: 'order'
      })
    }
  },
  onShow: function(){
    this.initEleWidth();
    this.getAddrList();
  },
  selectAddr: function(e){
    let item = e.currentTarget.dataset.item
    if(this.data.src == 'order'){
      var pages = getCurrentPages()
      var prevPage = pages[pages.length - 2]  //上一个页面

      prevPage.setData({
        addr: item
      })
      wx.navigateBack({
      })
    }
  },
  getAddrList: function(){
    var userCode = wx.getStorageSync('userInfo').userCode
    api.request(api.findAddrList, {
      userCode
    }).then(res => {
      this.data.addrList = res.tList || []
      this.setData({
        addrList: this.data.addrList,
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
  touchS: function(e){
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function(e){
    var index = e.currentTarget.dataset.index;

    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 0) {//移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      var list = this.data.addrList;
      if (index != "" && index != null) {
        list[parseInt(index)].left = left;
        this.setData({
          addrList: list
        })
      }
    }
  },
  touchE: function(e){
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      var list = this.data.addrList;
      if (index !== "" && index != null) {
        list[parseInt(index)].left = left;
        this.setData({
          addrList: list
        })
      }
    }
  },
  bindCheckbox: function(e){
    let addrList = this.data.addrList
    let index = e.currentTarget.dataset.index
    addrList[index].selected = !addrList[index].selected
    this.setData({
      addrList: this.data.addrList
    })
  },
  onToEdit: function(e){
    var consignee = e.currentTarget.dataset.consignee
    wx.setStorageSync('consignee', consignee)
    wx.navigateTo({
      url: '/pages/address/addOrEditAddress/addOrEditAddress?isEdit='+true
    })
  },
  delItem: function(e){
    wx.showModal({
      title: '提示',
      content: '您确定要删除该地址吗？',
      showCancel: false,
      success: (res) => {
        if (res.confirm) {
          var index = e.currentTarget.dataset.index;
          var list = this.data.addrList;
          list[index].isDel = 1;
          api.request(api.editOrDelAddr, list[index]).then(res => {
            list.splice(index, 1);
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 2000
            })
            this.getAddrList()
          }).catch(err => {
            console.log(err)
          })
        }
      }
    })
  },
  onNewAddress: function(e){
    wx.navigateTo({
      url: '/pages/address/addOrEditAddress/addOrEditAddress?isEdit=' + false,
    })
  }
})
