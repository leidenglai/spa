import { requestData } from 'utils/ajaxLoad'
import handleTemplate from 'utils/handleTemplate'
import template from 'tpl/components/sharePop.html'
import message from 'utils/message'

/**
 * 分享组件
 * 初始化参数
 * @param {Object} config    各个渠道的appid等：
 *   {
 *     facebook: {
 *       appId: xxxxxxx
 *     }
 *   }
 * 调用分享接口 弹出分享弹窗
 * window.spaShare.sharePop(config, callback)
 * @param {Object}   config     分享配置
          config.url            分享链接
          config.title          标题
          config.desc           内容
          config.img            图片
          config.img_title      图片名称
          config.from           来自哪儿
          config.caption        标志
 */

const templateHtml = handleTemplate(template);

const UA = navigator.appVersion;

let that = this,
  platformOs,
  callback = callback || function() {},
  wxConfig = {};

//QQ浏览器api
let qApiSrc = {
  lower: "//3gimg.qq.com/html5/js/qb.js",
  higher: "//jsapi.qq.com/get?api=app.share"
};
let wxApi = {
  JS_SDK: "https://res.wx.qq.com/open/js/jweixin-1.0.0.js"
}
let bLevel = {
  qq: {
    forbid: 0,
    lower: 1,
    higher: 2
  },
  uc: {
    forbid: 0,
    allow: 1
  }
};

let isqqBrowser = (UA.split("MQQBrowser/").length > 1) ? bLevel.qq.higher : bLevel.qq.forbid;
let isucBrowser = (UA.split("UCBrowser/").length > 1) ? bLevel.uc.allow : bLevel.uc.forbid;
let version = {
  uc: "",
  qq: ""
};
let isWeixin = false;

class SharePop {
  constructor() {
    this.popViewDom = $(document).find('#sharePop');
    this.popViewDom.html(_.template(templateHtml['sharePopTmpl'])())

    this.ucAppList = {
      weixin: ['kWeixin', 'WechatFriends', 1, '微信好友'],
      weixinFriend: ['kWeixinFriend', 'WechatTimeline', '8', '微信朋友圈'],
    };
    this.channelId = { // 渠道id 用于track
      'facebook': '004',
      'whatsApp': '010',
      'sms': '00000',
      'email': '00000',
      'weixin': '012',
      'weixinFriend': '013',
    }

    // 初始化
    platformOs = this.getPlantform();
    version.qq = isqqBrowser ? this.getVersion(UA.split("MQQBrowser/")[1]) : 0;
    version.uc = isucBrowser ? this.getVersion(UA.split("UCBrowser/")[1]) : 0;
    isWeixin = this.isWeixin();
    if ((isqqBrowser && version.qq < 5.4 && platformOs == "iPhone") || (isqqBrowser && version.qq < 5.3 && platformOs == "Android")) {
      isqqBrowser = bLevel.qq.forbid
    } else {
      if (isqqBrowser && version.qq < 5.4 && platformOs == "Android") {
        isqqBrowser = bLevel.qq.lower
      } else {
        if (isucBrowser && ((version.uc < 10.2 && platformOs == "iPhone") || (version.uc < 9.7 && platformOs == "Android"))) {
          isucBrowser = bLevel.uc.forbid
        }
      }
    }
    // 暂时不做微信
    // this.isloadqqApi();
    // this.isloadwxApi();
    requestData('/user/getSharekey').then(({ data }) => {
      _.forEach(data, (item, key) => {
        if (key == 'faceBook') {
          this.isLoadFacebookApi(__DEV__ ? '391289897724280' : item.appId)
        }
      })
    })

    this.bindEvent()
  }

  bindEvent() {
    const that = this;

    // 选择分享渠道
    this.popViewDom.on('tap', '.share-btn', function(e) {
      e.preventDefault();
      e.stopPropagation();

      that.share($(this).data('app'));
    });

    // 禁止拷贝的链接点击跳转
    this.popViewDom.on('tap', '#shareUrlWindow .share-copytip-link', function(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    // 关闭分享url
    this.popViewDom.on('tap', '.cancel, .mask-bg', function(e) {
      e.stopPropagation();
      that.closeUrlShare();
    });

    this.popViewDom.on('tap', '#mask .mask-bg', function(e) {
      e.stopPropagation();
      that.popViewDom.find('#mask').hide();
    });

    //关闭分享页面
    this.popViewDom.on('tap', '.cancel, .mask', function(e) {
      e.stopPropagation();
      that.closeShare();
    });
  }

  sharePop(config, callback) {
    this.config = config
    this.callback = callback

    this.url = config.url || '';
    this.title = config.title || '';
    this.desc = config.desc || '';
    this.img = config.img || '';
    this.img_title = config.img_title || '';
    this.from = config.from || 'spa';
    this.caption = config.caption || 'spa';

    this.closeUrlShare(false);
    this.popViewDom.show();

    setTimeout(() => {
      this.popViewDom.find('.mask').addClass('black');
      this.popViewDom.find('.content').addClass('top');
    }, 0);
  }

  share(to_app) {
    let that = this,
      title = this.title,
      url = this.url + "&channelId=" + this.channelId[to_app],
      desc = this.desc,
      img = this.img,
      img_title = this.img_title,
      from = this.from,
      caption = this.caption,
      callback = this.callback;

    if (to_app == 'facebook') {
      const uuid = that.getUuid(8, 16);
      const link = url + "&shareTrack=" + uuid;
      that.closeShare();

      FB.ui({
        method: 'share',
        title: title,
        mobile_iframe: true,
        href: link,
        caption: caption,
        description: desc,
        picture: img
      }, function(response) {
        if (!response || response.error_code) {
          console.log(response);
        } else {
          message.success('分享成功');
          typeof callback == "function" ? callback(that.channelId[to_app], uuid) : '';
        }
      });
    } else if (to_app == 'whatsApp') {
      if (isWeixin) {
        this.closeShare(false);

        message.info('Please click "More" button, then select "Open with Browser"');
      } else {
        that.closeShare();
        const uuid = that.getUuid(8, 16);
        const link = url + "&shareTrack=" + uuid;

        this.getShortUrl(link).then(({ data }) => {
          typeof callback == "function" ? callback(that.channelId[to_app], uuid) : '';
          var s = document.createElement('a');
          s.setAttribute('href', `whatsapp://send?text=${title} ${desc} ${encodeURIComponent(data)}`);
          s.setAttribute('data-action', 'share/whatsapp/share');
          s.click();
        });
      }
    } else if (to_app == 'sms') {
      if (isWeixin) {
        this.closeShare(false);

        message.info('Please click "More" button, then select "Open with Browser"');
      } else {
        that.closeShare();

        const uuid = that.getUuid(8, 16);
        const link = url + "&shareTrack=" + uuid;

        this.getShortUrl(link).then(({ data }) => {
          typeof callback == "function" ? callback(that.channelId[to_app], uuid) : '';

          var s = document.createElement('a');
          if (that.getPlantform() == 'iPhone') {
            s.setAttribute('href', `sms:&body=${title} ${desc} ${encodeURIComponent(data)}`);
          } else {
            s.setAttribute('href', `sms:?body=${title} ${desc} ${encodeURIComponent(data)}`);
          }
          s.click();
        });
      }
    } else if (to_app == 'email') {
      if (isWeixin) {
        this.closeShare(false);

        message.info('Please click "More" button, then select "Open with Browser"');
      } else {
        that.closeShare();

        const uuid = that.getUuid(8, 16);
        const link = url + "&shareTrack=" + uuid;

        this.getShortUrl(link).then(({ data }) => {
          typeof callback == "function" ? callback(that.channelId[to_app], uuid) : '';

          var s = document.createElement('a');
          s.setAttribute('href', `mailto:?subject=${title}&body=${desc} ${encodeURIComponent(data)}`);
          s.click();
        });
      }
    } else {
      // 暂时不处理 微信，朋友圈
    }
  }

  // 获取短链接
  getShortUrl(url) {
    return requestData('/product/convert2ShortUrl.do', {
      "longUrl": url
    })
  }

  //判断微信
  isWeixin() {
    const a = UA.toLowerCase();
    if (a.match(/MicroMessenger/i) == "micromessenger") {
      return true
    } else {
      return false
    }
  }

  // 判断操作系统
  getPlantform() {
    const ua = navigator.userAgent;
    if ((ua.indexOf("iPhone") > -1 || ua.indexOf("iPod") > -1)) {
      return "iPhone"
    }
    return "Android"
  }

  //获取浏览器版本
  getVersion(c) {
    var a = c.split("."),
      b = parseFloat(a[0] + "." + a[1]);
    return b
  }

  // 初始化facebook接口
  isLoadFacebookApi(appId) {
    if (!window.FB) {
      window.fbAsyncInit = function() {
        FB.init({
          appId: appId,
          xfbml: true,
          version: 'v2.9'
        });
        FB.AppEvents.logPageView();
      };

      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = __DEV__ ? "//sdk.facebook.com/facebook.sdk.js" : "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }
  };

  isloadqqApi() {
    if (isqqBrowser) {
      var b = (version.qq < 5.4) ? qApiSrc.lower : qApiSrc.higher;
      var d = document.createElement("script");
      var a = document.getElementsByTagName("body")[0];
      d.setAttribute("src", b);
      a.appendChild(d)
    }
  }

  isloadwxApi() {
    if (isWeixin) {
      var d = document.createElement("script");
      var a = document.getElementsByTagName("body")[0];
      d.setAttribute("src", wxApi.JS_SDK);
      a.appendChild(d)
    }
  }

  // 显示一个提示的全屏蒙版
  maskShow(t) {
    document.getElementById("mask").style.display = "block";
    document.getElementById("maskInfo").innerHTML = t;
    document.body.style.overflow = 'hidden';
  }

  // 生成随机字符串
  getUuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [],
      i;
    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random() * 16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join('');
  }

  //加载wx api
  weiXinReady() {
    var that = this;
    return new Promise(function(resolve) {
      if (wxConfig.appId) {
        resolve(wxConfig)
      } else {
        var url = encodeURIComponent(location.href.split('#')[0]);

        requestData('/mgr/wx/getSign', {
          "url": url
        }).then(function({ data }) {
          console.log(data);
          resolve(data);
        });
      }

    })
  }

  //关闭分享窗口
  closeShare(type) {
    this.popViewDom.find('.mask').removeClass('black');
    this.popViewDom.find('.content').removeClass('top');
    if (type === false) {
      this.popViewDom.hide();
    } else {
      setTimeout(() => {
        this.popViewDom.hide();
      }, 300);
    }
  }

  //关闭分享URl窗口
  closeUrlShare(type) {
    $('#shareUrlWindow .mask').removeClass('black');
    $('#shareUrlWindow .content').removeClass('top');
    if (type === false) {
      $('#shareUrlWindow').hide();
    } else {
      setTimeout(function() {
        $('#shareUrlWindow').hide();
      }, 300);
    }
  }
}

export default SharePop
