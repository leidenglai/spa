import 'libs/jquery.i18n.properties'
import 'css/main.less'
require("expose-loader?IScroll!libs/iscroll") // 滑动插件
import { Router } from 'director/build/director'

import { CDN_URL } from 'config'
import routesMap from 'js/routes'
import NavbarClass from 'components/navbar'
import handleTemplate from 'utils/handleTemplate'
import getLanguage from 'utils/getLanguage'

// 主容器 用于各个模块控制视图变化
window.appView = $('#container');

/**
 * 初始化语言包
 * 加载后载入相应的css
 * 再执行应用逻辑
 */
const language = getLanguage();
const initI18n = new Promise(function(next) {
  // 加载资浏览器语言对应的资源文件
  $.i18n.properties({
    name: 'socialshop', // 资源文件名称
    path: CDN_URL + '/i18n/', // 资源文件路径
    mode: 'map', // 用Map的方式使用资源文件中的值
    language: language,
    async: true,
    callback: function() {
      // 加载成功后加载相应css
      require(`css/lang/${language}.less`)

      // 继续向下执行
      next()
    }
  });
})

// 处理默认事件
document.addEventListener('touchmove', function(e) {
  event.preventDefault();
}, { passive: false });

initI18n.then(() => {
  let moduleInstanceStack = {};
  let currentModule = ''; //当前的模块名
  let zIndex = 0; // 模块的层级
  // let pageIndex = 0; // 模块唯一ID
  // let browerControl = false; // 区别点击跳转还是浏览器返回前进
  const regexp = /\/(\w+)\/?/

  // 装载导航栏
  const Navbar = new NavbarClass()

  /**
   * 路由的处理核心
   * 使用html5的history api实现路由
   *
   * 保存每一个已出现过的界面实例 同时页面dom保留
   * 通过z-index的改变实现页面显示顺序
   * 保留每一个模块的dom 最简单的实现保存页面状态的功能
   * 待优化：内存占用优化
   *
   * @param  {func} router  每个页面的路由
   * @param  {string} key   模块名
   * @return {func}         路由处理的回调函数
   */
  const routeHandler = (router, key) => (...query) => {
    router(query, (Controller, template, params = {}) => {
      // 提取模块名称
      const moduleName = regexp.exec(key)[1];
      // 处理模板字符串
      const templateHtml = handleTemplate(template)
      zIndex = zIndex + 1

      if (!moduleInstanceStack[moduleName]) {
        // 新模块

        // 装载主模板
        appView.append(_.template(templateHtml[`${moduleName}Tmpl`])())

        // 创建实例对象
        moduleInstanceStack[moduleName] = {
          moduleName: moduleName,
          instance: new Controller(templateHtml, params), //初始化
          queryData: params,
          selector: `#${moduleName}Content`,
          zIndex: zIndex
        };

      } else if (!_.isEqual(params, moduleInstanceStack[moduleName].queryData)) {
        // 已存在界面的模块，但是参数不一样，重新载入

        // 重载界面
        moduleInstanceStack[moduleName].instance.destructor();
        // 替换原模板
        appView.find(`#${moduleName}Content`).replaceWith(_.template(templateHtml[`${moduleName}Tmpl`])())

        moduleInstanceStack[moduleName] = {
          moduleName: moduleName,
          instance: new Controller(templateHtml, params), //初始化
          queryData: params,
          selector: `#${moduleName}Content`,
          zIndex: zIndex
        };
      } else {
        // 刷新界面
        moduleInstanceStack[moduleName].instance.refresh && moduleInstanceStack[moduleName].instance.refresh()
      }

      // 改变模块的z-index使其显示在最上层 也就是显示在页面中
      appView.find(moduleInstanceStack[moduleName].selector).css('z-index', zIndex)

      // // 重置开关
      // browerControl = false

    })
  };

  const routes = _.mapValues(routesMap, routeHandler);

  window.RouterController = new Router(routes).configure({
    html5history: true,
    before: () => {
      const route = RouterController.getRoute();

      currentModule = route[0];

      // navbar监听路由变化
      Navbar.listenRoute(route)

    }
  })

  RouterController.init()

  // window.addEventListener("popstate", function(e) {
  //     // 浏览器前进后退事件
  //   browerControl = true
  // });

})
