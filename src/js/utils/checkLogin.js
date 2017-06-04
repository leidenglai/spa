import loginIn from 'components/loginIn'

/**
 * 检查登录
 * @return {Promise}
 */
const checkLogin = function() {
  return new Promise(function(next) {
    // 检查是否已登录
    const isLogin = !_.isEmpty(localStorage.getItem('userId'))

    if (isLogin) {
      next()
    } else {
      // 调出登录界面
      loginIn().then(() => {
        next()
      })
    }
  })
}

export default checkLogin
