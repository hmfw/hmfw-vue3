import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

interface CustomAxiosInstance extends AxiosInstance {
  // 覆盖所有请求方法，使其直接返回 T 类型 (即 response.data.data 的类型)
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
}

interface SeriesItem {
  name: string
  data: (number | string)[]
  type?: 'line' | 'bar'
}

export interface EchartsResult {
  xData: string[]
  series: SeriesItem[]
  dataDesc?: string
  averageLineValue?: string | number
}

// 创建 axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: '/api', // 基础 URL
  headers: { 'Content-Type': 'application/json;charset=UTF-8' },
})

// 用于存储正在进行的请求
const pendingRequests = new Map<string, AbortController>()

// 生成唯一请求 key
function getRequestKey(config: AxiosRequestConfig) {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

// 跳转到登录页面
export const jumpToLogin = () => {
  console.log('跳转登录页面')
}

// 请求拦截器
instance.interceptors.request.use(
  async config => {
    try {
      // config.headers['Authorization'] = token
      // config.headers['token'] = ossToken
    } catch (error) {
      console.error('处理用户认证信息失败:', error)
    }

    // 处理重复请求
    const key = getRequestKey(config)
    console.log('Request Key:', key)
    // 如果已存在相同请求，取消前一个
    if (pendingRequests.has(key)) {
      const controller = pendingRequests.get(key)
      controller?.abort()
      pendingRequests.delete(key)
    }
    // 新建 controller 并挂载到 config
    const controller = new AbortController()
    config.signal = controller.signal
    pendingRequests.set(key, controller)

    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对响应数据做点什么
    const { data } = response
    // 响应后移除 pending
    const key = getRequestKey(response.config)
    pendingRequests.delete(key)
    // 登录失效
    if (data.code === -1) {
      console.log(response.config.url, data)
      if (import.meta.env.PROD) {
        jumpToLogin()
      }
      return Promise.reject(data)
    } else {
      return data.data
    }
  },
  error => {
    // 对响应错误做点什么
    console.error('Response error:', error)

    // 处理取消的请求
    if (error.config) {
      const key = getRequestKey(error.config)
      pendingRequests.delete(key)
    }

    if (error.response) {
      // 请求已发出，但服务器响应的状态码不在 2xx 范围内
      const { status, data } = error.response
      const message = data.message
      const notLogin = [
        '参数错误: token参数不能为空',
        '参数错误: accessToken参数不能为空',
        '系统运行异常: 用户登录已过期，请重新登录！',
      ].includes(message)

      if (notLogin && import.meta.env.PROD) {
        console.log('跳转登录', message)
        jumpToLogin()
        return Promise.reject(error)
      }
      switch (status) {
        case 400:
          ElMessage.error(message || '请求参数错误')
          break
        case 401:
          localStorage.removeItem('token')
          ElMessage.error('未授权，请重新登录')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error(message || '服务器内部错误')
          break
        default:
          ElMessage.error(message || `请求失败，状态码：${status}`)
      }
    } else if (error.name !== 'CanceledError') {
      ElMessage.error(error.message || '网络错误，请稍后再试')
    }
    return Promise.reject(error)
  }
)

// 导出 axios 实例，以便在特殊情况下直接使用
const typedInstance = instance as CustomAxiosInstance

export default typedInstance
