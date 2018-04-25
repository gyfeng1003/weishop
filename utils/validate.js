/**
 * 表单校验逻辑
 */
// 表单校验规则
const validators = {
  required: {
    rule: /.+/,
    //msg: '必填项不能为空'
    msg: '请将信息填写完整'
  },
  mobile: {
    rule: /^[\d]{11}$/,
    msg: '手机号格式不正确'
  },
  password: {
    rule: /^\d{6}$/,
    msg: '密码必须为6位数字'
  },
  code: {
    rule: /^\d{4}$/,
    msg: '验证码格式不正确'
  },
  same: {
    rule (val='', sVal='') {
      return val===this.data[sVal]
    },
    msg: '密码不一致'
  }
}

var check = function (value, opt, key, context) {
  if (typeof opt.type == 'function') {
    if (opt.type()) {
      context.setData({
        msg: opt.message
      })
      return true;
    }
    return false;
  }
  if (!_test(opt.type, value)) {
    context.setData({
      msg: opt.message
    })
    return true;
  }
  return false;
},
_test = function (name, value) {
  if (typeof validators[name] == 'function') return validators[name](value);
  return validators[name].rule.test(value);
}

const validateField = function(data, test, context){
  for (var key in test) {
    if (test[key] instanceof Array) {
      for (var j = 0; j < test[key].length; j++) {
        if (check(data[key], test[key][j], key, context)) {
          return true;
        }
      }
    } else if (check(data[key], test[key], key, context)) {
      return true;
    }
  }
}

module.exports = {
  validateField
}