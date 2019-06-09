import axios from 'axios'

axios.defaults.timeout = 20000

axios.interceptors.response.use(res => {
  return res
}, err => {
  Promise.reject(err)
})

export {
  axios
}