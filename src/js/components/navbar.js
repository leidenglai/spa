import Main from 'utils/main'
import handleTemplate from 'utils/handleTemplate'
import template from 'tpl/common/bottomNavbar.html'

export default class NavbarClass extends Main {
  constructor() {
    super()

    this.templateHtml = handleTemplate(template);
    this.navbarView = $('#bottomNavbar');

    this.init()
  }

  init() {
    // dom填充
    this.navbarView.html(_.template(this.templateHtml['bottomNavbarControlTmpl']))

    this.bindEvent()
  }

  bindEvent() {
    var that = this;
    this.navbarView.on('tap', '.nav', function(e) {
      e.stopPropagation();
      $(this).addClass('selected').siblings().removeClass('selected')
      const moduleName = $(this).data('href')

      // 页面跳转
      that.goModule(moduleName)
    })
  }

  show() {
    this.navbarView.find('.navbar').removeClass('down')
  }

  hide() {
    this.navbarView.find('.navbar').addClass('down')
  }

  /**
   * listenRoute navbar对路由监听的回调 路由变化时 navbar执行相应的操作
   * @param  {Array} route 路由包含的数据
   * @return undefind
   */
  listenRoute(route) {
    // route[0] 模块名称 其他是相应参数

    if (this.navbarView.find('.navbar .nav').hasClass(route[0])) {
      this.navbarView.find('.navbar .nav').removeClass('selected')
      this.navbarView.find(`.navbar .${route[0]}`).addClass('selected');
      this.show()
    } else {
      this.hide()
    }
  }
}
