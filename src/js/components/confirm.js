/**
 * 加强版confrim
 * @param  {Boolean} options.isSingle    是否只显示确定按钮  默认为两个操作按钮都显示
 * @param  {Func} options.okHandler      点击ok的处理函数
 * @param  {Func} options.cancelHandler  点击cancel的处理函数
 * @param  {String} options.title        标题
 * @param  {String|Node} options.content 内容
 * @param  {String} options.okText       确定按钮文字
 * @param  {String} options.cancelText   取消按钮上的文字
 *
 * 调用：
 * SuperConfirm({
    title: '确认手机号码',
    content: `<span>我们将发送验证码短信到这个号码:</span><br /><span class="blod">+${areaCode} ${telNum}</span>`,
    okHandler: () => {
      // ...
    }
  })
 *
 */

const templateHtml = `
  <div class="super-confrim">
    <div class="mask"></div>
    <div class="content">
      <div class="text">
        <div class="title"><%- data.title%></div>
        <div class="detail"><%= data.content%></div>
      </div>
      <div class="handles">
        <div class="botton cancel-btn"><%= data.cancelText%></div>
        <div class="botton ok-btn"><%= data.okText%></div>
      </div>
    </div>
  </div>
`

class SuperConfirm {
  constructor({
    isSingle,
    okHandler,
    cancelHandler,
    title,
    content,
    okText = $.i18n.prop('msg_ok'),
    cancelText = $.i18n.prop('msg_cancel')
  }) {
    this.confirmDom = $('#confirmBox');
    const html = _.template(templateHtml, { variable: 'data' })({ title, content, okText, cancelText });

    this.node = $(html)
    setTimeout(() => {
      this.node.addClass('showAni')
    }, 0)

    this.okHandler = okHandler;
    this.cancelHandler = cancelHandler;

    this.confirmDom.append(this.node)

    if (isSingle) {
      this.node.find('.handles .cancel-btn').addClass("hide");
      this.node.find('.handles .ok-btn').addClass("width-max");
    }

    this.bindEvent(okHandler, cancelHandler)

  }

  handlePopstate(self) {
    self.destructor()
    self.cancelHandler && self.cancelHandler()
  }

  bindEvent() {
    const that = this;

    this.node.off('tap', '.handles .ok-btn').on('tap', '.handles .ok-btn', function(e) {
      e.stopPropagation();

      that.destructor()

      that.okHandler && that.okHandler()
    })

    this.node.off('tap', '.handles .cancel-btn').on('tap', '.handles .cancel-btn', function(e) {
      e.stopPropagation();

      that.destructor()

      that.cancelHandler && that.cancelHandler()
    })

    this.node.off('tap', '.mask').on('tap', '.mask', function(e) {
      e.stopPropagation();

      that.destructor()

      that.cancelHandler && that.cancelHandler()
    })

    // 监听浏览器前进后退按钮操作 发生变化时隐藏界面
    window.addEventListener('popstate', this.handlePopstate.bind(null, this), false);
  }

  destructor() {
    // 解绑事件
    window.removeEventListener('popstate', this.handlePopstate)
    setTimeout(() => {
      this.node.remove()

    }, 0)
  }
}

const superConfirm = (parmas) => {
  new SuperConfirm(parmas)
}

export default superConfirm
