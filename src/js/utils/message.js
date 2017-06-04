/**
 * 全局消息提示
 * message.info()
 * message.success()
 * message.error()
 * message.warning()
 */
const template = `<div class="message-notice message-<%- data.type%>"><spen class="anticon"><%-data.text%></spen></div>`;

class Message {
  constructor() {
    this.messageDom = $('#messageBox');
    this.duration = 1500; // 自动关闭的延时，单位秒
    this.bindEvent();
  }

  info(text) {
    this.install(text, 'info')
  }
  success(text) {
    this.install(text, 'success')
  }
  error(text) {
    this.install(text, 'error')
  }
  warning(text) {
    this.install(text, 'warning')
  }

  install(text, type) {
    const html = _.template(template, { variable: 'data' })({ text, type });

    let node = $(html)

    this.messageDom.prepend(node)
    node.addClass('move-down-fade')

    setTimeout(() => {
      this.uninstall(node)
    }, this.duration)
  }

  uninstall(node) {
    node.removeClass('move-down-fade').addClass('move-down-leave');

    setTimeout(() => {
      node.remove()
    }, 300)
  }

  bindEvent() {
    const that = this;
    this.messageDom.off('touchstart', '.message-notice').on('touchstart', '.message-notice', function(e) {
      e.stopPropagation();
      e.preventDefault();
      that.uninstall($(this))
    })
  }
}
const message = new Message()

export default message
