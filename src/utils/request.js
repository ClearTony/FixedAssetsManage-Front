import axios from 'axios'
import router from "@/router";
import config from '@/config'

// 统一使用代理方式，避免直接访问后端端口
const getApiBaseURL = () => {
  // 无论是本地访问还是内网访问，都使用代理
  return '/api'
}

// 创建可一个新的axios对象
const request = axios.create({
    baseURL: getApiBaseURL(),   // 统一使用代理
    timeout: 30000                          // 30s请求超时
})

// request 拦截器
// 可以自请求发送前对请求做一些处理
// 比如统一加token，对请求参数统一加密
request.interceptors.request.use(config => {
    // 如果是FormData，不设置Content-Type，让浏览器自动设置
    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json;charset=utf-8';        // 设置请求头格式
    }
    let user = JSON.parse(localStorage.getItem("xm-user") || '{}')  // 获取缓存的用户信息
    config.headers['token'] = user.token  // 设置请求头

    return config
}, error => {
    console.error('request error: ' + error) // for debug
    return Promise.reject(error)
});

// response 拦截器
// 可以在接口响应后统一处理结果
request.interceptors.response.use(
    response => {
        let res = response.data;

        // 兼容服务端返回的字符串数据
        if (typeof res === 'string') {
            res = res ? JSON.parse(res) : res
        }
        if (res.code === '401') {
            router.push('/login')
        }
        return res;
    },
    error => {
        console.error('response error: ' + error) // for debug
        return Promise.reject(error)
    }
)


export default request