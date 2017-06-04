import { requestData } from 'utils/ajaxLoad'
import routesMap from 'js/routes'
import message from 'utils/message'

/**
 * 公共模块
 */
export default class Main {
  constructor() {
    this.pageData = {}; //页面数据

    this.appViewDom = {}; //缓存页面Dom

    this.requestData = requestData; //ajax获取数据模块
  }

  /*
   * 设置title
   *
   * @parmas title {String}[必填] title 文字
   */
  setTitle = (title) => {
    const titleContent = `${title} | spa`;

    document.title = titleContent;

    // 获取当前模块名
    const moduleName = RouterController.getRoute()[0];

    window.moduleInstanceStack[moduleName].titleContent = titleContent;
  }
  /**
   * 页面跳转
   *
   * @parmas module {String} [必选] 模块名
   * @parmas params {Object} [可选] 跳转参数
   * @parmas type {String} [可选] new 打开新窗口
   */
  goModule = (moduleName, params = {}, type = '') => {
    let url = moduleName;
    const routesKeys = _.keys(routesMap);
    let router = [];
    let _params = [];

    _.forEach(routesKeys, (val) => {
      const keys = val.split('/')
      keys.splice(0, 1)

      if (keys[0] == moduleName) {
        router = _.map(keys, val => val.replace(':', ''));
      }
    })
    if (router.length == 0) {
      // message.error('路由配置或者跳转错误')
      return false;
    } else if (router.length > 1) {
      for (var i = 1; i < router.length; i++) {
        _params.push(params[router[i]])
      }
      url = `/${moduleName}/${_params.join('/')}`
    } else {
      url = `/${moduleName}`
    }

    if (type === 'new') {
      window.open(url);
    } else {
      // h5路由跳转
      RouterController.setRoute(url)
    }
  }

  /**
   * json字符串处理 换行符等
   *
   * @parmas str {String} [必选] 要转换的字符串
   * @parmas type {Number} [必选] 1:替换 2：还原
   *
   * @return _str {String} 处理好的模板对象
   */
  handleString = (str, type) => {
    var _str = str;
    if (type === 1) {
      _str = str.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, "\\\"")
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
    }
    return _str;
  }

  /**
   ** 乘法函数，用来得到精确的乘法结果
   ** 说明：javascript的浮点数相乘结果会有误差。这个函数返回较为精确的乘法结果。
   ** 调用：accMul(arg1,arg2)
   ** 返回值：arg1乘以 arg2的精确结果
   **/
  accMul = (arg1, arg2) => {
    arg1 = arg1 || 0;
    arg2 = arg2 || 0;
    var m = 0,
      s1 = arg1.toString(),
      s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length;
    } catch (e) {}
    try {
      m += s2.split(".")[1].length;
    } catch (e) {}
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
  }
}
