import message from 'utils/message'

/**
 * 表单验证
 *
 * @param  nodes {String} [必选] form表单dom
 *
 * @return ValidateForm Promise 表单模块的Promise对象
 */
class ValidateForm {
  constructor(nodes) {
    this.nodes = nodes;
    this.opt = {
      //正则
      reg_email: /^\w+\@[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/i, //验证邮箱
      reg_num: /^\d+$/, //验证数字
      reg_int: /^[1-9]\d*$/, //验证正整数
      reg_price: /^(0|[1-9][0-9]{0,5})(\.[0-9]{1,2})?$/, //验证价格
      reg_chinese: /^[\u4E00-\u9FA5]+$/, //验证中文
      reg_mobile: /^1[34578]{1}[0-9]{9}$/, //验证手机
      reg_idcard: /^\d{14}\d{3}?\w$/, //验证身份证
      reg_numletter: /[^\d|chun]/, //验证数字和字母

      msg_required: (name) => $.i18n.prop('msg_not_null', name),
      msg_num: (name) => $.i18n.prop('msg_illegal', name),
      msg_int: $.i18n.prop('msg_illegal'),
      msg_price: $.i18n.prop('msg_illegal'),
      msg_price2: $.i18n.prop('msg_price_error')
    };
    this.options = $.extend(this.opt);

    return new Promise(this.validate.bind(this))
  }

  validate(resolve, reject) {
    //validate form ;
    var _this = this;
    var isValid = true;
    _this.nodes.find("input,textarea").each(function() {
      var _validate = $(this).attr("check");
      // 判断input的高度是否是0 因为隐藏的元素高度为0，不校验隐藏input
      var _hidden = $(this).height();
      if (_validate && _hidden !== 0) {
        var arr = _validate.split(' ');
        for (var i = 0; i < arr.length; i++) {
          if (!_this.check($(this), arr[i])) {
            isValid = false; // 验证不通过阻止表单提交，开关false
            return isValid; // 跳出
          }
        }
      }
    });

    isValid ? resolve() : reject();
  }

  check(obj, _match) {
    var _this = this;
    var _val = $.trim(obj.val());
    //根据验证情况，显示相应提示信息，返回相应的值
    switch (_match) {
      case 'required':
        return _val ? true : _this.showErrorInfo(obj, false, _this.opt.msg_required($(obj).data('name')));
      case 'email':
        return _this.regmatch(_val, this.opt.reg_email) ? true : _this.showErrorInfo(obj, false, _this.opt.msg_num($(obj).data('name')));
      case 'num':
        return _this.regmatch(_val, this.opt.reg_num) ? true : _this.showErrorInfo(obj, false, _this.opt.msg_num);
      case 'int':
        return _this.regmatch(_val, this.opt.reg_int) ? true : _this.showErrorInfo(obj, false, _this.opt.msg_price);
      case 'price':
        if (parseFloat(_val) <= 0) {
          return _this.showErrorInfo(obj, false, _this.opt.msg_price2)
        }
        return _this.regmatch(_val, this.opt.reg_price) ? true : _this.showErrorInfo(obj, false, _this.opt.msg_price);
      case 'mobile':
        return _this.regmatch(_val, this.opt.reg_mobile) ? true : _this.showErrorInfo(obj, false);
      case 'numletter':
        return _this.regmatch(_val, this.opt.reg_numletter) ? true : _this.showErrorInfo(obj, false);
      case 'passport':
        return _this.regmatch(_val, this.opt.reg_passport) ? true : _this.showErrorInfo(obj, false);
      case 'pwd1':
        pwd1 = _val; //实时获取存储pwd1值
        return true;
      case 'pwd2':
        return pwdEqual(_val, pwd1) ? true : _this.showErrorInfo(obj, false);
      case 'ajaxvalid':
        return ajaxValidate(_val, obj.attr("ajaxurl")) ? true : _this.showErrorInfo(obj, false);
      default:
        return true;
    };
  }

  pwdEqual(val1, val2) {
    return val1 === val2 ? true : false;
  }

  regmatch(value, regExp) {
    if (value !== "") {
      return regExp.test(value);
    }
    return true;
  }

  // 暂不使用
  // ajaxValidate(value, url) {
  //   var isValid = false;
  //   $.ajax({
  //     type: 'POST',
  //     url: url,
  //     data: { value: value },
  //     dataType: 'json',
  //     timeout: 300,
  //     async: false,
  //     success(result) {
  //       isValid = result.Success;
  //     }

  //     error(xhr, type) {}
  //   })
  //   return isValid;
  // }

  showErrorInfo(obj, mark, msg) {
    //显示错误信息
    if (!mark) {
      if (msg) {
        message.error(msg)
      }
    }
    return mark;
  }
};

export default ValidateForm;
