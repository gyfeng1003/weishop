let baseUrl = "https://www.235shanghai.com/fashion";
//let baseUrl = "http://192.168.31.188:8098/fashion"

module.exports={
  request: function(url, data, type){
    var data = data || {};
  
    return new Promise(function(resolve, reject){
      if(type == 'form'){
        wx.showLoading({
          title: '',
          mask: true
        })
      }
      wx.request({
        url: baseUrl + url,
        data: data,
        method: "POST",
        header: {
          'content-type': 'text/html'
        },
        success: function (res) {
          if (res.statusCode == 200 && res.data.meta.success) {
            if (type == 'form') {
              wx.hideLoading()
            }
            resolve(res.data)
          }else{
            wx.showModal({
              title: '提示',
              content: res.data.meta.message,
              showCancel: false
            })
            wx.hideLoading()
            reject(res)
          }
        },
        fail: function (res) {
          if (type == 'form') {
            wx.hideLoading()
          }
          wx.showModal({
            title: '提示',
            content: '网络异常:'+res.errMsg,
            showCancel: false
          })
          reject(res)
        },
        complete: function(){
          wx.hideNavigationBarLoading() //完成停止加载
          wx.stopPullDownRefresh() //停止下拉刷新
        }
      })
    })
  },
  baseUrl: baseUrl,
  checkToken: '/v1/wechat/bindWx',
  getUserInfo: '/v1/wechat/isBindWX',
  getEmployee: '/v1/user/searchEmployee',
  followEmployee: '/v1/user/followEmployee',
  allEmployee: '/v1/user/allEmployee',
  listNotEmployee: '/v1/user/listNotEmployee',
  infocenter: '/v1/article/infocenter',
  one: '/v1/article/one',
  articleGoods: '/v1/goods/articleGoods',
  goodsOne: '/v1/goods/one',
  createOrder: '/v1/order/create',
  orderList: '/v1/order/find',
  createAddr: '/v1/consignee/add',
  editOrDelAddr: '/v1/consignee/edit',
  findAddrList: '/v1/consignee/find',
  relateGoods: '/v1/goods/articleGoods',
  addWork: '/v1/article/add',
  editOrDelWork: '/v1/article/edit',
  addProduct: '/v1/goods/add',
  editOrDelGoods: '/v1/goods/edit',
  publishComment:'/v1/comment/addArticle',
  lookWorkByUserId:'/v1/article/person',
  findAllGoods: '/v1/goods/findAll',
  setEmployee: '/v1/user/setEmployee',
  findfriendEmployee: '/v1/user/friendEmployee',
  findMyFans: '/v1/user/myFans',
  addCommentForGoods: '/v1/comment/addGoods',
  addOrEditRelateGoods: '/v1/goods/addOrEditArticleGoods',
  delGoodsItem: '/v1/goods/addGoodsDetail',
  sendCaptchaCode: '/v1/captcha/sendCaptchaCode',
  bindMobile: '/v1/user/bindMobile',
  editOrder: '/v1/order/edit',
  getGoodsComment: '/v1/comment/listByGoodsId',
  getWorksComment: '/v1/comment/listByArticleId'
}
