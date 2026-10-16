import axios from 'axios'

export const TOKEN_KEY = 'token'
export const LOGOUT_EVENT = 'auth:logout'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// A 401 on a request that carried a token means the token is expired or invalid.
// A 401 on login (no token sent) is just bad credentials, so it is left alone.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event(LOGOUT_EVENT))
    }
    return Promise.reject(error)
  },
)

// Pulls the server's { message } out of an Axios error.
export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message
  if (error.request) return 'Cannot reach the server. Please try again.'
  return 'Something went wrong.'
}

export default api
