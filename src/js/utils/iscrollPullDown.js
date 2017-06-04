/**
 * 下拉刷新插件
 * @param  wrapperName {String} [必选] iscroll容器
 * @param  iScrollConfig {Object} [可选] iScroll配置
 * @param  pullDownActionHandler {Function} [可选] 下拉操作回调函数
 * @param  pullUpActionHandler {Function} [可选] 上滑操作回调函数
 *
 * @return function {Function} 返回模块构造函数
 */
var PullDownHandler = function(wrapperName, iScrollConfig, pullDownActionHandler, pullUpActionHandler) {
  var iScrollConfig, pullDownActionHandler, pullUpActionHandler, pullDownEl, pullDownOffset, pullUpEl, scrollStartPos;
  var pullThreshold = 5;
  var me = this;

  function showPullDownElNow(className) {
    // Shows pullDownEl with a given className
    pullDownEl.style.transitionDuration = '';
    pullDownEl.style.marginTop = '';
    pullDownEl.className = 'pullDown ' + className;
  }
  var hidePullDownEl = function(time, refresh) {
    // Hides pullDownEl
    pullDownEl.style.transitionDuration = (time > 0 ? time + 'ms' : '');
    pullDownEl.style.marginTop = '';
    pullDownEl.className = 'pullDown scrolledUp';

    // If refresh==true, refresh again after time+10 ms to update iScroll's "scroller.offsetHeight" after the pull-down-bar is really hidden...
    // Don't refresh when the user is still dragging, as this will cause the content to jump (i.e. don't refresh while dragging)
    if (refresh) setTimeout(function() { me.myScroll.refresh(); }, time + 10);
  }

  //初始化
  this.init = function() {
    var wrapperObj = document.querySelector(wrapperName);
    var scrollerObj = wrapperObj.children[0];

    if (pullDownActionHandler) {
      // If a pullDownActionHandler-function is supplied, add a pull-down bar at the top and enable pull-down-to-refresh.
      // (if pullDownActionHandler==null this iScroll will have no pull-down-functionality)
      pullDownEl = document.createElement('div');
      pullDownEl.className = 'pullDown scrolledUp';
      pullDownEl.innerHTML = '<div class="box"><span class="pullDownIcon"></span><span class="pullDownLabel">' + $.i18n.prop('msg_pull_down_refresh') + '</span></div>';
      scrollerObj.insertBefore(pullDownEl, scrollerObj.firstChild);
      pullDownOffset = pullDownEl.offsetHeight;
    }
    if (pullUpActionHandler) {
      // If a pullUpActionHandler-function is supplied, add a pull-up bar in the bottom and enable pull-up-to-load.
      // (if pullUpActionHandler==null this iScroll will have no pull-up-functionality)
      pullUpEl = document.createElement('div');
      pullUpEl.className = 'pullUp';
      pullUpEl.innerHTML = '<span class="pullUpIcon"></span><span class="pullUpLabel">' + $.i18n.prop('msg_pull_up_to_load_more') + '</span>';
      scrollerObj.appendChild(pullUpEl);
    }

    me.myScroll = new IScroll(wrapperObj, iScrollConfig);

    me.myScroll.on('refresh', function() {
      if ((pullDownEl) && (pullDownEl.className.match('pullDownLoading'))) {
        pullDownEl.querySelector('.pullDownLabel').innerHTML = $.i18n.prop('msg_pull_down_refresh');

        if (this.y >= 0) {
          // The pull-down-bar is fully visible:
          // Hide it with a simple 250ms animation
          hidePullDownEl(250, true);

        } else if (this.y > -pullDownOffset) {
          // The pull-down-bar is PARTLY visible:
          // Set up a shorter animation to hide it

          // Firt calculate a new margin-top for pullDownEl that matches the current scroll position
          pullDownEl.style.marginTop = this.y + 'px';

          // CSS-trick to force webkit to render/update any CSS-changes immediately: Access the offsetHeight property...
          pullDownEl.offsetHeight;

          // Calculate the animation time (shorter, dependant on the new distance to animate) from here to completely 'scrolledUp' (hidden)
          // Needs to be done before adjusting the scroll-positon (if we want to read this.y)
          var animTime = (250 * (pullDownOffset + this.y) / pullDownOffset);

          // Set scroll positon to top
          // (this is the same as adjusting the scroll postition to match the exact movement pullDownEl made due to the change of margin-top above, so the content will not "jump")
          this.scrollTo(0, 0, 0);

          // Hide pullDownEl with the new (shorter) animation (and reset the inline style again).
          setTimeout(function() { // Do this in a new thread to avoid glitches in iOS webkit (will make sure the immediate margin-top change above is rendered)...
            hidePullDownEl(animTime, true);
          }, 0);

        } else {
          // The pull-down-bar is completely off screen:
          // Hide it immediately
          hidePullDownEl(0, true);
          // And adjust the scroll postition to match the exact movement pullDownEl made due to change of margin-top above, so the content will not "jump"
          this.scrollBy(0, pullDownOffset, 0);
        }
      }
      if ((pullUpEl) && (pullUpEl.className.match('pullDownLoading'))) {
        pullUpEl.className = 'pullUp';
        pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
      }
    });

    me.myScroll.on('scrollStart', function() {
      scrollStartPos = this.y; // Store the scroll starting point to be able to track movement in 'scroll' below
    });

    me.myScroll.on('scroll', function() {
      if (pullDownEl || pullUpEl) {
        if ((scrollStartPos == 0) && (this.y == 0)) {
          // 'scroll' called, but scroller is not moving!
          // Probably because the content inside wrapper is small and fits the screen, so drag/scroll is disabled by iScroll

          // Fix this by a hack: Setting "myScroll.hasVerticalScroll=true" tricks iScroll to believe
          // that there is a vertical scrollbar, and iScroll will enable dragging/scrolling again...
          this.hasVerticalScroll = true;

          // Set scrollStartPos to -1000 to be able to detect this state later...
          scrollStartPos = -1000;
        } else if ((scrollStartPos == -1000) &&
          (((!pullUpEl) && (!pullDownEl.className.match('flip')) && (this.y < 0)) ||
            ((!pullDownEl) && (!pullUpEl.className.match('flip')) && (this.y > 0)))) {
          // Scroller was not moving at first (and the trick above was applied), but now it's moving in the wrong direction.
          // I.e. the user is either scrolling up while having no "pull-up-bar",
          // or scrolling down while having no "pull-down-bar" => Disable the trick again and reset values...
          this.hasVerticalScroll = false;
          scrollStartPos = 0;
          this.scrollBy(0, -this.y, 0); // Adjust scrolling position to undo this "invalid" movement
        }
      }

      if (pullDownEl) {
        if (this.y > pullDownOffset + pullThreshold && !pullDownEl.className.match('flip')) {
          showPullDownElNow('flip');
          this.scrollBy(0, -pullDownOffset, 0); // Adjust scrolling position to match the change in pullDownEl's margin-top
          pullDownEl.querySelector('.pullDownLabel').innerHTML = $.i18n.prop('msg_release_refresh');
        } else if (this.y < 0 && pullDownEl.className.match('flip')) { // User changes his mind...
          hidePullDownEl(0, false);
          this.scrollBy(0, pullDownOffset, 0); // Adjust scrolling position to match the change in pullDownEl's margin-top
          pullDownEl.querySelector('.pullDownLabel').innerHTML = $.i18n.prop('msg_pull_down_refresh');
        }
      }
      if (pullUpEl) {
        if (this.y < (this.maxScrollY - pullThreshold) && !pullUpEl.className.match('flip')) {
          pullUpEl.className = 'pullUp flip';
          pullUpEl.querySelector('.pullUpLabel').innerHTML = $.i18n.prop('msg_release_to_load_more');
        } else if (this.y > (this.maxScrollY + pullThreshold) && pullUpEl.className.match('flip')) {
          pullUpEl.className = 'pullUp';
          pullUpEl.querySelector('.pullUpLabel').innerHTML = $.i18n.prop('msg_pull_up_to_load_more');
        }
      }
    });

    me.myScroll.on('scrollEnd', function() {
      if ((pullDownEl) && (pullDownEl.className.match('flip'))) {
        showPullDownElNow('pullDownLoading');
        pullDownEl.querySelector('.pullDownLabel').innerHTML = $.i18n.prop('msg_loading');
        pullDownActionHandler(this); // Execute custom function (ajax call?)
      }
      if ((pullUpEl) && (pullUpEl.className.match('flip'))) {
        pullUpEl.className = 'pullUp pullDownLoading';
        pullUpEl.querySelector('.pullUpLabel').innerHTML = $.i18n.prop('msg_loading');
        pullUpActionHandler(this); // Execute custom function (ajax call?)
      }
      if (scrollStartPos = -1000) {
        // If scrollStartPos=-1000: Recalculate the true value of "hasVerticalScroll" as it may have been
        // altered in 'scroll' to enable pull-to-refresh/load when the content fits the screen...
        this.hasVerticalScroll = this.options.scrollY && this.maxScrollY < 0;
      }
    });

    return me.myScroll;
  };

  //主动刷新
  this.refresh = function() {
    if (pullDownEl) {
      showPullDownElNow('pullDownLoading');
      pullDownEl.querySelector('.pullDownLabel').innerHTML = $.i18n.prop('msg_loading');
      pullDownActionHandler(); // Execute custom function (ajax call?)
    }
    if (pullUpEl) {
      pullUpEl.className = 'pullUp pullDownLoading';
      pullUpEl.querySelector('.pullUpLabel').innerHTML = $.i18n.prop('msg_loading');
      pullUpActionHandler(); // Execute custom function (ajax call?)
    }
  }
}

export default PullDownHandler
