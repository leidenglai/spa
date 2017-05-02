import { API_URL, MD5_SUBJOIN } from 'config'
import md5 from 'md5'
import message from 'utils/message'

/**
 * 获取数据
 * @function requestData
 *
 * @param  api {String} [必选] 接口名
 * @param  data {Object} [可选] [默认值：{}]往后端发送的数据对象
 * @param  md5Type {Boolean} [可选] [默认值：false] 是否md5加密校验， 如果是 需要在调用处加载md5模块
 *
 * @return requestData {Promise} Promise
 */
export function requestData(api, data, md5Type) {
  return new Promise(function(resolve, reject) {
    var requsetUrl = API_URL + api,
      md5Type = md5Type || false;

    //合并默认参数
    var params = $.extend({
      userId: '111111', // 用户ID
      token: '111111', // 权限Token
    }, data || {});

    if (md5Type) {
      //将所有参数值合并为一个字符串，然后md5加密
      var _keyArr = [];
      var verify = '';

      _keyArr.sort();
      verify = _keyArr.join('');
      //加上约定字符串
      verify = verify + MD5_SUBJOIN;

      params.verify = md5(verify);
    }

    var lock = true;
    var internetErrorPage = function(type) {
      var errorDom = $('#errorPage');
      if (type === 'hide') {
        errorDom.addClass('hide');
      } else {
        errorDom.removeClass('hide');
        //填充网络错误的单例函数
        if (!lock) return lock;
        lock = false;

        errorDom.find('.error-tips').html($.i18n.prop('msg_internet_error'));
        errorDom.find('.error-btn .btn').html($.i18n.prop('msg_reload'));

        //reload
        errorDom.find('.error-btn .btn').off('touchend').on('touchend', function(e) {
          e.stopPropagation();
          e.preventDefault();
          window.location.reload();
        });
      }
    }

    $.ajax({
      url: requsetUrl,
      type: 'post',
      data: params,
      timeout: 30000,
      dataType: 'json',
      success: function(res) {
        internetErrorPage('hide');
        if (res.code === 1) {
          //返回后端数据、 请求时的参数
          resolve({ data: res.data, params: params, code: res.code });
        } else {
          // 报错给promise
          reject(res);
          message.error(res.msg);
        }
      },
      error: function(xhr, textStatus) {
        if (textStatus == 'parsererror') {
          console.log('Server Error!');
        } else if (textStatus == 'timeout' || textStatus == 'abort') {
          //显示网络错误页面
          internetErrorPage('show');
          console.log('Timeout Error!');
        } else if (xhr.status === 401) {
          reject({ code: 401, msg: "Token Error!" });
          message.error('Token Error!');
        } else {
          //显示网络错误页面
          internetErrorPage('show');
          console.log('Internet Error!');
        }
        xhr = null;
        return;
      },
    });
  })
}
