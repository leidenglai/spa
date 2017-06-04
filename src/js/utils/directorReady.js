/**
 * director.js 的onpopstate 垫片
 * 一些手机浏览器在加载时 没有onpopstate方法 会导致报错
 * @return {func} director的执行方法
 */
const directorReady = callback => {
  var interval;

  if (window.onpopstate !== null) {
    callback();
    return;
  }
  interval = setInterval(function() {
    if (window.onpopstate !== null) {
      callback();
      clearInterval(interval);
    }
  }, 100);
}

export default directorReady
