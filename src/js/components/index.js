/*
 * 组件库
 *
 */
import handleTemplate from 'utils/handleTemplate'
import template from 'tpl/components/index.html'

var Components = function(selector) {
  return new Components.prototype.init(selector);
};

Components.prototype = {
  init: function(selector) {

    handleTemplate(template);
    //目标容器
    this.selector = selector || '#container';

    return this;
  },

  //获取模板字符串
  getTplData: function(tplName) {
    return handleTemplate(template)[tplName];
  },

  /*
   * 数量选择控制器
   * @parmas config {Object} [必选]
   * config.minQuantity 最小数量
   * config.maxQuantity 最大数量
   * config.value 默认值
   * config.callback 回调
   **/
  quantityControl: function(config) {
    var conf = config && typeof config === 'object' ? config : {},
      min = conf.minQuantity || 1,
      max = conf.maxQuantity || 9999,
      value = conf.value || min,
      callback = conf['callback'];

    var el = this.selector,
      _isId = /^#/.test(el),
      exports = {},
      tmplData = {
        el: el,
        min: min,
        max: max,
        isId: _isId,
        value: value
      },
      html = _.template(this.getTplData('quantityControlTmpl'), { variable: 'data' })(tmplData);

    appView.find(el).replaceWith(html);

    //验证输入quantity
    appView.off('input', el + ' .quantity-input').on('input', el + ' .quantity-input', function(e) {
      e.stopPropagation();
      var quantity = parseInt($(this).val());
      if (quantity === 0 || quantity === 1) {
        quantity = 1;
        $(this).siblings('.btn-minus').addClass('btn-b-disable').removeClass('btn-b-active');
      } else if (quantity >= max) {
        if (quantity > max) {
          window.socialShopNativeApi && window.socialShopNativeApi.tips($.i18n.prop('msg_product_purchase', max));
        }
        quantity = max;
        $(this).siblings('.btn-plus').addClass('btn-b-disable').removeClass('btn-b-active');
      } else {
        $(this).siblings('.btn-b').addClass('btn-b-active').removeClass('btn-b-disable');
      }
      if (!isNaN(quantity)) {
        $(this).val(quantity);

        //执行回调
        callback && callback.bind(this)(quantity);
      }
    });
    appView.off('change', el + ' .quantity-input').on('change', el + ' .quantity-input', function(e) {
      e.stopPropagation();
      var quantity = parseInt($(this).val());
      if (isNaN(quantity) || quantity <= min) {
        $(this).siblings('.btn-minus').addClass('btn-b-disable').removeClass('btn-b-active');
        quantity = min;
        $(this).val(quantity);

        //执行回调
        callback && callback.bind(this)(quantity);
      }
    });
    //修改quantity
    appView.off('touchend', el + '.quantity-select .btn-b').on('touchend', el + '.quantity-select .btn-b', function(e) {
      e.stopPropagation();
      var quantity = parseInt($(this).siblings('.quantity-input').val());

      if ($(this).hasClass('btn-plus')) { //添加
        if (quantity >= max - 1) {
          window.socialShopNativeApi && window.socialShopNativeApi.tips($.i18n.prop('msg_product_purchase', max));

          $(this).addClass('btn-b-disable').removeClass('btn-b-active');
          quantity = max;
        } else if (quantity === min) {
          $(this).siblings('.btn-minus').addClass('btn-b-active').removeClass('btn-b-disable');
          quantity = quantity + 1;
        } else {
          quantity = quantity + 1;
        }
      } else if ($(this).hasClass('btn-minus')) {
        if (quantity <= min + 1) {
          quantity = min;
          $(this).addClass('btn-b-disable').removeClass('btn-b-active');
        } else if (quantity === max) {
          $(this).siblings('.btn-plus').addClass('btn-b-active').removeClass('btn-b-disable');
          quantity = quantity - 1;
        } else {
          quantity = quantity - 1;
        }
      }
      $(this).siblings('.quantity-input').val(quantity);

      //执行回调
      callback && callback.bind(this)(quantity);
    });

    //使失去焦点 缩回键盘
    exports.offKeyboard = function(elem) {
      $(elem).find('.quantity-input').blur();
    };

    return exports;
  }
};

Components.prototype.init.prototype = Components.prototype;

export default Components;
