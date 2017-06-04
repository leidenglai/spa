/**
 * 私有方法 处理动画显示的style
 * @type {Object}
 */
const factories = {
  getAniTargetStyle: (event) => {
    const { currentTarget } = event
    const width = _.max([currentTarget.clientWidth, currentTarget.clientHeight])
    const pos = factories.getAniPos(event)

    const style = {
      width: `${2*pos.r}px`,
      height: `${2*pos.r}px`,
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      borderRadius: `${pos.r}px`
    }

    return style
  },

  /**
   *
   * 计算动画的相对坐标和半径
   * @param  {Object} event 事件
   * @return {Object} 动画事件
   */
  getAniPos: function(event) {
    const { currentTarget, pos } = event
    const { pow, max, sqrt } = Math
    const { currentX, currentY } = factories.getElementFixed(currentTarget)
    let r, x, y, _x1, _y1, _x2, _y2;

    _x1 = pos.x1 - currentX
    _y1 = pos.y1 - currentY

    _x2 = currentTarget.offsetWidth - _x1
    _y2 = currentTarget.offsetHeight - _y1

    r = sqrt(pow(max(_x1, _x2), 2) + pow(max(_x1, _x2), 2))

    x = _x1 - r
    y = _y1 - r

    return { x, y, r }
  },

  /**
   * 获取元素绝对位置
   * @param  {Object} element dom元素
   * @return {Object}         绝对位置
   */
  getElementFixed: function(element) {　　　　
    var actualLeft = element.offsetLeft;　　　　
    var actualTop = element.offsetTop;　　　　
    var current = element.offsetParent;　　　　
    while (current !== null) {　　　　　　
      actualLeft += current.offsetLeft;　　　　　　
      actualTop += current.offsetTop;　　　　　　
      current = current.offsetParent;　　　　
    }　　　　
    return {
      currentX: actualLeft,
      currentY: actualTop
    };　　
  }
}

const htmlTmpl = `<span class="tapActiveAni" style="height: 100%; width: 100%; position: absolute; top: 0px; left: 0px; overflow: hidden; pointer-events: none;"></span>`

/**
 * tap事件动画插件
 * 对绑定tap事件的dom加上class: tapActive, 则显示动画
 */
class TapActiveAni {
  constructor() {
    this.tapActiveView = $('body');
    this.bindEvent();

    this.position = {
      'absolute': true,
      'relative': true
    }
  }

  /**
   * 调用私有方法
   * @param  {String}    fun  方法名
   * @param  {...Object} args options
   * @return {Function}       执行私有方法
   */
  call(fun, ...args) {
    if (!factories[fun]) return
    return factories[fun].apply(this, args)
  }

  bindEvent() {
    var that = this;
    this.tapActiveView.on('tapAni', '.tapActive', function(e) {
      e.stopPropagation();
      var _this = $(this)
      if ($(this).hasClass('disable')) return false;

      if (!that.position[_this.css('position')]) {
        _this.css('position', 'relative')
      }

      if (_this.find('.tapActiveAni').length <= 0) {
        _this.prepend(htmlTmpl)
      }
      var aniTarget = $('<span class="aniTarget"></span>')

      aniTarget.css(that.call('getAniTargetStyle', e))

      _this.find('.tapActiveAni').append(aniTarget)

      setTimeout(() => {
        aniTarget.remove()
      }, 1000)
    })
  }
}

export default TapActiveAni
