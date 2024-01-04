import { AxiosResponse, CancelTokenSource } from 'axios'
import { default as getAxiosInterceptor } from '../../interceptors/axiosInterceptor'
import { AuthData, AuthResource } from '../../models/AuthResource'

export const Authenticate = async (
  data: AuthResource,
  cancelToken: CancelTokenSource | undefined | null = null
): Promise<AuthData> => {
  let body = new FormData()
  body.append('username', data.username ?? '')
  body.append('password', data.password ?? '')
  const endpoint = '/auth/signin'
  try {
    const axios = await getAxiosInterceptor()
    const response = await axios.post<AuthResource, AxiosResponse<AuthData>>(endpoint, body, {
      cancelToken: cancelToken?.token
    })
    var auth = {
      username: response.data.username,
      session_token: response.data.session_token
    } as AuthData
    return Promise.resolve(auth)
  } catch (err) {
    return Promise.reject(err)
  }
}

export const Signup = async (
  data: AuthResource,
  cancelToken: CancelTokenSource | undefined | null = null
): Promise<AuthData> => {
  let body = new FormData()
  body.append('username', data.username ?? '')
  body.append('password', data.password ?? '')
  const endpoint = '/auth/signup'
  try {
    const axios = await getAxiosInterceptor()
    const response = await axios.post<AuthResource, AxiosResponse<AuthData>>(endpoint, body, {
      cancelToken: cancelToken?.token
    })
    var auth = {
      username: response.data.username,
      session_token: response.data.session_token
    } as AuthData
    return Promise.resolve(auth)
  } catch (err) {
    return Promise.reject(err)
  }
}

export const Signout = async (cancelToken: CancelTokenSource | undefined | null = null) => {
  const endpoint = '/auth/signout'
  try {
    const axios = await getAxiosInterceptor()
    await axios.post<null, AxiosResponse<null>>(endpoint, null, {
      cancelToken: cancelToken?.token
    })
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}
