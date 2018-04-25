module.exports = {
  init: function(that){
      var tempData = Object.assign({
        searchData: {
          searchContent: '',
          showClearBtn: false
        }
      }, that.data)

      that.setData(tempData)
  },
  onSearchBarClearEvent: function(e, that, callback) {
      that.data.searchData.showClearBtn = false
      that.data.searchData.searchContent = ""

      that.setData(that.data)

      if (typeof (callback) == 'function') {
        callback()
      }
  },
  onSearchBarChangedEvent: function (e, that, callback) {
      that.data.searchData.showClearBtn = e.detail.value.length > 0
      that.data.searchData.searchContent = e.detail.value

      that.setData(that.data)

      if (typeof (callback) == 'function') {
        callback()
      }
  },
  onAddGoods: function (e, that, callback) {
    wx.navigateTo({
      url: '../../../../pages/my/productManage/addOrEditProduct/addOrEditProduct?isEdit=false',
    })
    if (typeof (callback) == 'function') {
      callback()
    }
  }
}