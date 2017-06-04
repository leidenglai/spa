import 'libs/jquery.i18n.properties'
import 'css/main.less'
require("expose-loader?IScroll!libs/iscroll") // 滑动插件
import { Router } from 'director/build/director'

import { checkLoginInModule, DEF_REQUEST_CONFIG } from 'config'
import routesMap from 'js/routes'
import NavbarClass from 'components/navbar'
import SharePop from 'components/sharePop'
import TapActiveAni from 'components/tapActiveAni'
import getLanguage from 'utils/getLanguage'
import initI18n from 'utils/initI18n'
import directorReady from 'utils/directorReady'
import loadModule from 'utils/loadModule'
import checkLogin from 'utils/checkLogin'
import { requestData } from 'utils/ajaxLoad'

// 主容器 用于各个模块控制视图变化
window.appView = $('#container');

// 处理默认事件
document.addEventListener('touchmove', function(e) {
  event.preventDefault();
}, { passive: false });

initI18n.then(() => {
  window.moduleInstanceStack = {};
  let currentModule = ''; //当前的模块名
  let zIndex = 1;
  const regexpName = /\/(\w+)\/?/

  /**
   * 初始化分享接口
   * 保存为全局方法
   */
  window.spaShare = new SharePop({
    facebook: {
      appid: 'xxxxxxx'
    }
  });

  // 装载导航栏
  window.Navbar = new NavbarClass()

  // 加载所有tap事件的动画
  new TapActiveAni()

  /**
   * 路由的处理核心
   * 使用html5的history api实现路由
   *
   * 保存每一个已出现过的界面实例 同时页面dom保留
   * 1、通过z-index的改变实现页面显示顺序
   *  2、 display的方式(更优的解决方案)
   * 保留每一个模块的dom 最简单的实现保存页面状态的功能
   * 待优化：内存占用优化
   *
   * @param  {func} router  每个页面的路由
   * @param  {string} key   模块名
   * @return {func}         路由处理的回调函数
   */
  let prveModuleName = '';

  const routeHandler = (router, key) => (...query) => {
    //格式请求参数 将query转为键值对
    const captures = key.match(/:([^\/]+)/ig);
    let length = 0,
      queryObj = {},
      capture = '';

    if (captures) {
      length = captures.length;
      for (var i = 0; i < length; i++) {
        capture = captures[i];
        queryObj[capture.slice(1)] = query[i]
      }
    }

    // 提取模块名称
    // 第二种方式 通过display来改变
    if (prveModuleName && moduleInstanceStack[prveModuleName]) {
      // 隐藏上一次打开的模块
      appView.find(moduleInstanceStack[prveModuleName].selector).attr('style', 'display:none');
    }

    const moduleName = regexpName.exec(key)[1];
    prveModuleName = moduleName;

    // zIndex = zIndex + 1
    if (checkLoginInModule.indexOf(moduleName) == -1) {
      router(loadModule.bind(undefined, moduleName, queryObj))
    } else {
      checkLogin().then(() => {

        router(loadModule.bind(undefined, moduleName, queryObj))
      })
    }
  };

  const routes = _.mapValues(routesMap, routeHandler);

  window.RouterController = new Router(routes).configure({
    html5history: true,
    notfound: () => {
      directorReady(() => {
        // h5路由跳转
        RouterController.setRoute('/store')
      })
    },
    before: () => {
      const route = RouterController.getRoute();

      currentModule = route[0];

      // 去除所有的input焦点
      appView.find('input,textarea').blur()

      // 路由变化处理
      Navbar.listenRoute(route)

    }
  })

  RouterController.init();
})
