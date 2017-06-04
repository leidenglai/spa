let vid, userId, token, appId;

function getCookie(cName) {
  if (document.cookie.length > 0) {
    let cStart = document.cookie.indexOf(cName + "=")
    if (cStart != -1) {
      cStart = cStart + cName.length + 1
      let cEnd = document.cookie.indexOf(";", cStart)
      if (cEnd == -1) cEnd = document.cookie.length
      return unescape(document.cookie.substring(cStart, cEnd))
    }
  }
  return false
}

/**
 * 处理当前的vv id逻辑
 * @return {String} vid
 */
export function getVid() {
  if (__DEV__) return 'vvxxxxxxxxx';
  if (!vid) {
    vid = getCookie('ns_vid')
  }
  return vid
}

/**
 * 处理当前的userId逻辑
 * @return {String} userId
 */
export function getUid() {
  // 是否登录
  const userId = localStorage.getItem('userId');
  if (userId) return userId;

  return getVid()
}

/**
 * 处理当前的token逻辑
 * @return {String} token
 */
export function getToken() {
  let token = localStorage.getItem('token');
  if (token) return token;

  if (__DEV__) return 'xxxxxxxxxxxx';

  if (!token) {
    token = getCookie('ns_token')
  }

  return token
}

/**
 * 处理当前的appId逻辑
 * @return {String} token
 */
export function getAppId() {
  if (__DEV__) return 'xxxxxxx';

  if (!appId) {
    appId = getCookie('ns_buyer_appId')
  }
  return appId
}
