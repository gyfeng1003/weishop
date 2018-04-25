const api=require('../../../api/api.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    products: [],
    loadError: false,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getCurrUserWork()
  },
  getCurrUserWork: function(){
    var userCode = wx.getStorageSync('userInfo').userCode
    api.request(api.lookWorkByUserId, {
      userCode
    }).then(res=>{
      this.data.works = res.tList
      this.setData({
        works: this.data.works,
        loadError: false,
        loading: false
      })
    }).catch(err=>{
      this.setData({
        loadError: true,
        loading: false
      })
    })
  },
  editOrDel: function(e){
    let type = e.currentTarget.dataset.type
    let articleId = e.currentTarget.dataset.id
    let work = e.currentTarget.dataset.work
    if(type == 'edit'){
      wx.setStorageSync('work', e.currentTarget.dataset.item)
      wx.navigateTo({
        url: '/pages/my/workManage/addOrEditWork/addOrEditWork?id=' + articleId
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '您确定要删除该作品吗？',
        showCancel: false,
        success:(res)=>{
          if(res.confirm){
            work.isDel = 1
            api.request(api.editOrDelWork, work)
            .then(res=>{
              wx.showToast({
                title: '删除成功',
              })
              this.getCurrUserWork()
            }).catch(err=>{
              console.log(err)
            })
          }
        }
      })
    }
  },
  onAddOrEditWork: function(e){
    wx.navigateTo({
      url: '/pages/my/workManage/addOrEditWork/addOrEditWork?isEdit=false',
    })
  },
  onWorkDetail: function(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/workDetail/workDetail?articleId='+id,
    })
  },
  resetTry: function(){
    this.getCurrUserWork()
  }
})
