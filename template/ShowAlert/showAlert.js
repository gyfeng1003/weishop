/*  
显示toast提示  
title:    提示的内容 必填  
icon:     图标，//请指定正确的路径，选填  
duration: 提示的延迟时间，单位毫秒，默认：1500, 10000永远存在除非手动清除 选填  
mask:     是否显示透明蒙层，防止触摸穿透，默认：true 选填  
fun:       接口调用成功的回调函数 选填  
 */  
function showAlert(obj) {  
    if (typeof obj == 'object' && obj.title) {  
        var that = getCurrentPages()[getCurrentPages().length - 1];//获取当前page实例  
        obj.isShow = true;//开启toast  
        that.setData({  
            showAlert: obj
        });  
    } else {  
        console.log('showAlert fail:请确保传入的是对象并且title必填');  
    }  
}  
/**  
 *手动关闭toast提示  
 */  
function hideAlert() {  
    var that = getCurrentPages()[getCurrentPages().length - 1];//获取当前page实例  
    if (that.data.showAlert) {  
        that.setData({  
            'showAlert.isShow': false  
        });  
    }  
}  
module.exports = {  
    showAlert: showAlert,  
    hideAlert: hideAlert  
} 