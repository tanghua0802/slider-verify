/* eslint-disable */
import axios from 'axios'

const service = axios.create({
  baseURL: '',
  timeout: 3000
})

service.interceptors.request.use(
  async config => {
      if (!config.url) {
        Promise.reject('没有接口地址')
        return false
      }
      if (!config.headers) {
        config.headers = {}
      }
      if (!config.data) {
        config.data = {}
      }
      if (!config.method) {
        config.method = 'post'
      }
      return config
    },
    error => {
      return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
  async response => {
      const res = response.data
      return res
    },
    error => {
      return Promise.reject(error)
    })

export default service
