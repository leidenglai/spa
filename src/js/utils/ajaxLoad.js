import { API_URL, MD5_SUBJOIN, DEF_REQUEST_CONFIG } from 'config'
import md5 from 'md5'
import message from 'utils/message'

/**
 * 获取数据
 * @function requestData
 *
 * @param  api {String} [必选] 接口名
 * @param  data {Object} [可选] [default: {}]往后端发送的数据对象
 * @param  options {Object} [可选] 请求参数
 * {
 *   md5: false, // [default: false] 是否md5加密校验， 如果是 需要在调用处加载md5模块
 *   progress: false // [default: false] 是否显示 加载进度，暂时不可用 需要后端返回正确的Content-Length
 * }
 *
 * @return requestData {Promise} Promise
 */
export function requestData(api, data = {}, options = {}) {
  return new Promise(function(resolve, reject) {
    var requsetUrl = API_URL + api;

    //合并默认参数
    var params = _.assign({
      userId: getUid(), // 用户ID
      token: getToken(), // 权限Token

    }, DEF_REQUEST_CONFIG, data);

    if (options.md5) {
      //将所有参数值合并为一个字符串，然后md5加密
      var _keyArr = [];
      var verify = '';

      for (var key in params) {
        if (key === 'productPics' || key === 'description') { //不加密校验图片地址、描述
          continue;
        }

        _keyArr.push(_.trim(params[key]));
      }

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

    // ajax 参数配置
    let ajaxConfig = {
      url: requsetUrl,
      type: 'post',
      data: params,
      timeout: 30000,
      dataType: 'json',
      success: (res) => {
        internetErrorPage('hide');
        if (res.code === 1) {
          //返回后端数据、 请求时的参数
          resolve({ data: res.data, params: params, code: res.code });
        } else {
          // 报错给promise
          console.log(res.msg);

          reject(res);
        }
      },
      error: (xhr, textStatus) => {
        if (textStatus == 'parsererror') {
          console.log('Server Error!');
        } else if (textStatus == 'timeout' || textStatus == 'abort') {
          //显示网络错误页面
          internetErrorPage('show');
          console.log('Timeout Error!');
        } else if (xhr.status === 401) {
          // 清除已登录标记
          localStorage.removeItem('userId')

          reject({ code: 401, msg: "Token Error!" });
        } else {
          //显示网络错误页面
          internetErrorPage('show');
          console.log('Internet Error!');
        }
        xhr = null;
        return;
      }
    }

    if (options.progress) {
      ajaxConfig.xhrFields = {
        onloadstart: (event) => {
          console.log('start')
        },
        onprogress: (event) => {
          console.log(event)
        },
        onloadend: (event) => {
          console.log('end')
        }
      }
    }

    $.ajax(ajaxConfig);
  })
}
