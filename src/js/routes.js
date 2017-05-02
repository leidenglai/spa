const routesMap = {
  // 商店
  "/store": (query, cb) => {
    require.ensure([], (require) => {
      // 加载控制器
      const Controller = require('js/app/store').default

      // 加载模板
      const template = require('tpl/store.html')
      cb(Controller, template)
    })
  },
  // 购物车
  "/cart": (query, cb) => {
    require.ensure([], (require) => {

      // 加载控制器
      const Controller = require('js/app/cart').default

      // 加载模板
      const template = require('tpl/cart.html')
      cb(Controller, template)
    })
  }
};

export default routesMap
