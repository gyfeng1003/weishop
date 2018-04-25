var SearchBar = require('../../template/SearchBar/SearchBar.js'),
api = require('../../api/api.js');
const toastApi = require('../../template/ShowToast/showToast.js'); //弹窗提醒
let app = getApp()
var timer;
Page({
  data: {
    employee: [],
    inputVal: '',
    searchFlag: true,
    toHome: false,
    toMine: false,
    toFriend: false,
    loadError: false,
    loading: true,
    searchParam:'',
    pagination: {
      offset: 0,
      limit: 10
    },
    page: 1,
    pages: 0
  },
  onLoad: function () {
    SearchBar.init(this)
  },
  onShow: function(){
    this.findFriendEmployee(1, true)
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    if (this.data.searchParam.length>0){
      this.searchEmployee(1, true, this.data.searchParam)
    }else{
      this.findFriendEmployee(1, true)
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.page != this.data.pages) {
      if (this.data.searchParam.length > 0) {
        this.searchEmployee(this.data.page + 1, false, this.data.searchParam)
      }else{
        this.findFriendEmployee(this.data.page + 1, false)
      }
    }
  },
  onSearchBarChangedEvent:function(e){
    this.data.searchFlag = true
    SearchBar.onSearchBarChangedEvent(e, this)
    this.setData({
      searchParam: e.detail.value.trim()
    })
    if (this.data.searchParam.length == 11){
      try {
        clearTimeout(timer);
      } catch (e) {
        console.log(e);
      }
      timer = setTimeout(()=>{
        this.searchEmployee(1, true, this.data.searchParam)
      }, 600)
    }else{
      this.setData({
        employee: [],
        searchFlag: this.data.searchFlag
      })
    }
    if (this.data.searchParam.length == 0){
      this.findFriendEmployee(1, true)
    }
  },
  bindInput: function(e){
    this.setData({
      inputVal: e.detail.value.trim()
    })
  },
  onSearchBarClearEvent: function(e){
    SearchBar.onSearchBarClearEvent(e, this)
    this.setData({
      employee: [],
      searchFlag: true
    })
    this.findFriendEmployee(1, true)
  },
  searchEmployee: function(pageNo, overried, value){
    var userId = wx.getStorageSync('userInfo').userId
    var pagination = this.data.pagination
    this.data.pagination = {
      offset: (pageNo - 1) * pagination.limit,
      limit: pagination.limit
    }
    this.setData({
      pagination: this.data.pagination
    })

    api.request(api.getEmployee, {
      mobile: value,
      userId,
      ...this.data.pagination
    }).then((res) => {
      var employee = res.tList || []
      this.data.searchFlag = true
      if (employee.length == 0) {
        this.data.searchFlag = false,
        this.data.pages = this.data.page
      }else{
        this.data.page = pageNo
      }
      this.setData({
        employee: overried ? employee : this.data.employee.concat(employee),
        searchFlag: this.data.searchFlag,
        loadError: false,
        loading: false,
        page: this.data.page,
        pages: this.data.pages
      })
    }).catch(error => {
      this.setData({
        loadError: true,
        loading: false
      })
    })
  },
  findFriendEmployee: function(pageNo, overried){
    var userCode = wx.getStorageSync('userInfo').userCode
    var pagination = this.data.pagination
    this.data.pagination = {
      offset: (pageNo - 1) * pagination.limit,
      limit: pagination.limit
    }
    this.setData({
      pagination: this.data.pagination
    })

    api.request(api.findfriendEmployee, {
      userCode,
      ...this.data.pagination
    }).then((res) => {
      let employee = res.tList || []
      this.data.searchFlag = true
      if (employee.length == 0) {
        this.data.searchFlag = false
        this.data.pages = this.data.page
      }else{
        this.data.page = pageNo
      }
      this.setData({
        employee: overried ? employee : this.data.employee.concat(employee),
        searchFlag: this.data.searchFlag,
        loadError: false,
        loading: false,
        page: this.data.page,
        pages: this.data.pages
      })
    }).catch(error => {
      this.setData({
        loadError: true,
        loading: false
      })
    })
  },
  toNavigate: function(e){
    let type = e.currentTarget.dataset.type

    if(type == 'toHome'){
      this.setData({
        toHome: true,
        toFriend: false,
        toMine: false
      })
      wx.switchTab({
        url: '/pages/index/index'
      })
    } else if (type == 'toFriend'){
      this.setData({
        toHome: false,
        toFriend: true,
        toMine: false
      })
      wx.switchTab({
        url: '/pages/search/search'
      })
    }else{
      this.setData({
        toHome: false,
        toFriend: false,
        toMine: true
      })
      wx.switchTab({
        url: '/pages/my/index'
      })
    }
  },
  follow: function(e){
    let type = e.currentTarget.dataset.type
    var friendCode = e.currentTarget.dataset.info
    if(type='follow'){
      api.request(api.followEmployee, {
        userCode: app.globalData.userInfo.userCode,
        friendCode
      }).then(res=>{
        wx.showToast({
          title: '关注成功',
        })
        this.searchEmployee(this.data.inputVal)
      }).catch(err=>{
        console.log(err)
      })
    }
  },
  lookWork:function(e) {
    let user = e.currentTarget.dataset.user
    
    if (user.isFollow == '1'){
      wx.setStorageSync('userCode', user.userCode)
      wx.switchTab({
        url: '/pages/index/index?userCode=' + user.userCode,
      })
    }
  }
})
