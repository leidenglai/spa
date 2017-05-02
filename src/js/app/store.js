/**
 * 商店列表页
 *
 */
import Main from 'utils/main'
import PullDownHandler from 'utils/iscrollPullDown'
import message from 'utils/message'

class StoreClass extends Main {
  constructor(templateHtml) {
    //继承公共方法
    super()

    this.templateHtml = templateHtml;

    this.appViewDom = appView.find('#storeContent');

    this.productListData = [];

    this.pageData = [];

    this.init();
  }

  init() {
    this.setTitle($.i18n.prop('msg_shop'));

    // ....

    this.mainScroll = new IScroll('#storeContentScroll', {
      probeType: 2,
      bounceEasing: 'quadratic',
      deceleration: 0.005
    });

    this.bindEvent();
  }

  refresh() {
    this.setTitle($.i18n.prop('msg_shop'));
  }

  //获取后端数据
  getListData() {}

  // 填充页面
  fillPage() {}

  //绑定事件
  bindEvent() {}

  //退出执行
  destructor() {}
}

export default StoreClass;
