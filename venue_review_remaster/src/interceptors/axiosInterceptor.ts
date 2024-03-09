import { getAuthCookie } from '@/storageClient/storageclient'
import { store } from '@/store'
import axios from 'axios'
import { Notyf } from 'notyf'
import appSettings from './appsettings.json'

const axiosNodeInstance = axios.create({
  baseURL: appSettings.apiUrl
})

const notyf = new Notyf({
  dismissible: true,
  position: { x: 'right', y: 'top' }
})

axiosNodeInstance.interceptors.request.use(async (config: any) => {
  // Get data from async storage for processing reasons
  let auth = await getAuthCookie()
  if (auth != null && auth.token != null) {
    config.headers.Authorization = `${auth.token}`
  }
  return config
})

axiosNodeInstance.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (axios.isCancel(error)) return Promise.reject('Cancelled request')
    else {
      if (error.response == null) {
        notyf.error('Network error. Try again later!')
        return Promise.reject('Network error')
      }
      if (error.response.status === 403) {
        // notyf.error('You cannot do that...')
        return Promise.reject('Forbidden')
      }
      if (error.response.status === 401) {
        // notyf.error('Authentication error.')
        store.commit('SIGNOUT') // Rejection handled on next in few lines anyways. No need to reject here too.
      }
      return Promise.reject(error || 'Something went wrong')
    }
  }
)

export { axiosNodeInstance }
