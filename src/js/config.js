let SERVER_PROTOCOL = 'http://'

// 开发环境使用http协议
if (__DEV__) {
  SERVER_PROTOCOL = 'http://'
}

// 后端 API 地址

// 使用ip便于手机测试
export const APP_URL = 'http://127.0.0.1:8080'
export const CDN_URL = 'http://127.0.0.1:8082'
export const API_URL = 'http://127.0.0.1:8083'

// 需要登录检查的模块
export const checkLoginInModule = [
  'setting',
]
export const MD5_SUBJOIN = '000000'
