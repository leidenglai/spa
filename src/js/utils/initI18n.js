import 'libs/jquery.i18n.properties'
import getLanguage from 'utils/getLanguage'
const commonLangData = require('i18n/spa.properties')

/**
 * 初始化语言包 将语言保存到全局
 * 加载后载入相应的css
 * 再执行应用逻辑
 */
window.spaLanguage = getLanguage();
document.querySelector("html").setAttribute('class', window.spaLanguage);

/**
 * 配置异步语言加载
 * 因为require函数太特别了，他是webpack底层用于加载模块
 * 所以必须明确的声明模块名，require函数在这里只能接受字符串，不能接受变量
 */
const languageList = {
  'zh_CN': cb => {
    require.ensure([], (require) => {
      require('css/lang/zh_CN.less')
      const langData = require('i18n/spa_zh_CN.properties')

      cb(commonLangData + langData)
    })
  },
  'en_US': cb => {
    require.ensure([], (require) => {
      require('css/lang/en_US.less')
      const langData = require('i18n/spa_en_US.properties')

      cb(commonLangData + langData)
    })
  }
}

const initI18n = new Promise(function(next) {
  // 加载资浏览器语言对应的资源文件
  $.i18n.properties({
    name: 'spa', // 资源文件名称
    mode: 'map', // 用Map的方式使用资源文件中的值
    language: spaLanguage,
    loadFileOption: languageList,
    async: true,
    callback: function() {
      // 继续向下执行
      next()
    }
  });
})

export default initI18n;
