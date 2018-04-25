const api=require('../../api/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadError: false,
    loading: true,
    comment: '',
    finish: false,
    orderState: ['待付款', '待发货', '已发货待收货', '已完成', '退款中', '订单已取消'],
    roleType:'',
    pagination: {
      offset: 0,
      limit: 6
    },
    page: 1,
    pages: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.roleType = wx.getStorageSync('userInfo').roleType
    
    this.setData({
      roleType: this.data.roleType,
      userCode: options.userCode ? options.userCode: ''
    })
    // 获取订单列表
    this.getOrderList(1, true, options.userCode)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getOrderList(1, true, this.data.userCode)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.pages != this.data.page){
      this.getOrderList(this.data.page+1, false, this.data.userCode)
    }
  },
  bindPickerChange: function (e) {
    let index = e.currentTarget.dataset.index
    this.data.orderList[index].type = e.detail.value
    this.editOrder(this.data.orderList[index], index)
  },
  editOrder: function(order, index){
    api.request(api.editOrder, order).then(res=>{
      var newOrder = res.entity
      this.data.orderList[index] = order;
      this.setData({
        orderList: this.data.orderList
      })
    }).catch(err=>{
      console.log(err)
    })
  },
  onComment: function(e){
    let index = e.currentTarget.dataset.index
    let orderList = this.data.orderList
    orderList[index].showComment = !orderList[index].showComment
    this.setData({
      orderList
    })
  },
  onPublish: function(e){
    if (!this.data.comment || this.data.comment.trim() == '') {
      return
    }
    var id = e.currentTarget.dataset.id
    var userCode = wx.getStorageSync('userInfo').userCode
    api.request(api.addCommentForGoods + '/' + id, {
      content: this.data.comment.trim(),
      userCode
    }).then(res=>{
      wx.showToast({
        title: '发表成功',
      })
      this.setData({
        showComment: false,
        finish: true
      })
    }).catch(err=>{
      console.log(err)
    })
  },
  bindInput: function(e){
    this.setData({
      comment: e.detail.value
    })
  },
  resetTry: function(){
    this.getOrderList(1, true, this.data.userCode)
  },
  cancelOrder: function(e){
    let index = e.currentTarget.dataset.index
    this.data.orderList[index].type = 5
    wx.showModal({
      title: '提示',
      content: '您确定要取消该订单吗？',
      success: res=>{
        if(res.confirm){
          this.editOrder(this.data.orderList[index], index)
        }
      }
    })
  },
  getOrderList: function (pageNo, overried, user){
    if(!user){
      var user = wx.getStorageSync('userInfo').userCode
    }
    var pagination = this.data.pagination
    this.data.pagination = {
      offset: (pageNo - 1) * pagination.limit,
      limit: pagination.limit
    }
    this.setData({
      pagination: this.data.pagination
    })
    api.request(api.orderList, {
      userCode: user,
      ...this.data.pagination
    }).then(res => {
      var orderList = res.tList
      if (orderList.length == 0){
        this.data.pages = this.data.page
      }else{
        this.data.page = pageNo
      }
      this.setData({
        orderList: overried?orderList: this.data.orderList.concat(orderList),
        loadError: false,
        loading: false,
        page: this.data.page,
        pages: this.data.pages
      })
    }).catch(err => {
      this.setData({
        loadError: true,
        loading:false
      })
    })
  }
})

