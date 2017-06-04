/**
 * 加载模块
 * @param  {String} moduleName 模块名
 * @param  {Object} params     模块参数
 * @param  {String} zIndex     显示层级
 * @param  {Object} Controller 主js逻辑
 * @param  {String} template   模板字符串
 */
function loadModule(moduleName, params, Controller, template) {
  const selector = `#${moduleName}Content`;
  if (!moduleInstanceStack[moduleName]) {
    // 新模块
    // 装载主模板
    appView.append(_.template(template)())

    const nodes = appView.find(selector);

    moduleInstanceStack[moduleName] = {}

    Object.assign(moduleInstanceStack[moduleName], {
      moduleName: moduleName,
      instance: new Controller(template, nodes, params), //初始化
      queryData: params,
      selector,
      nodes
    })
  } else if (!_.isEqual(params, moduleInstanceStack[moduleName].queryData)) {
    // 已存在界面的模块，但是参数不一样，重新载入
    // 重载界面
    moduleInstanceStack[moduleName].instance.destructor();

    // 替换原模板
    appView.append(_.template(template)());

    const nodes = appView.find(selector);

    Object.assign(moduleInstanceStack[moduleName], {
      moduleName: moduleName,
      instance: new Controller(template, nodes, params), //初始化
      queryData: params,
      selector,
      nodes,
    })
  } else {
    // 设置title
    document.title = moduleInstanceStack[moduleName].titleContent;

    // 刷新界面
    moduleInstanceStack[moduleName].instance.refresh && moduleInstanceStack[moduleName].instance.refresh()
  }

  // 改变模块的z-index使其显示在最上层 也就是显示在页面中
  // appView.find(moduleInstanceStack[moduleName].selector).css('z-index', zIndex)
  //
  // 第二种方式 通过display来改变
  appView.find(moduleInstanceStack[moduleName].selector).attr('style', 'display:block');
}

export default loadModule
