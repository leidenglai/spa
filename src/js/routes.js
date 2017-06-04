const routesMap = {
  // 商店
  "/store": (cb) => {
    require.ensure([], (require) => {
      // 加载控制器
      const Controller = require('js/app/product/store').default

      // 加载模板
      const template = require('tpl/product/store.html')
      cb(Controller, template)
    })
  },
  // 购物车
  "/cart": (cb) => {
    require.ensure([], (require) => {

      // 加载控制器
      const Controller = require('js/app/product/cart').default

      // 加载模板
      const template = require('tpl/product/cart.html')

      cb(Controller, template)
    })
  }
};

export default routesMap
