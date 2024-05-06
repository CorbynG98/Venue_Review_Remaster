import { AxiosResponse, CancelTokenSource } from 'axios'
import { axiosNodeInstance as axios } from '../../interceptors/axiosInterceptor'
import { AuthData, AuthResource } from '../../models/AuthResource'

export const Authenticate = async (
  data: AuthResource,
  cancelToken: CancelTokenSource | undefined | null = null
): Promise<AuthData> => {
  const body = new FormData()
  body.append('username', data.username ?? '')
  body.append('password', data.password ?? '')
  const endpoint = '/auth/signin'
  try {
    const response = await axios.post<AuthResource, AxiosResponse<AuthData>>(endpoint, body, {
      cancelToken: cancelToken?.token
    })
    const auth = {
      username: response.data.username,
      token: response.data.token,
      fullName: response.data.fullName,
      profile_photo_filename: response.data.profile_photo_filename
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
  const body = new FormData()
  body.append('username', data.username ?? '')
  body.append('password', data.password ?? '')
  const endpoint = '/auth/signup'
  try {
    const response = await axios.post<AuthResource, AxiosResponse<AuthData>>(endpoint, body, {
      cancelToken: cancelToken?.token
    })
    const auth = {
      username: response.data.username,
      token: response.data.token,
      fullName: response.data.fullName,
      profile_photo_filename: response.data.profile_photo_filename
    } as AuthData
    return Promise.resolve(auth)
  } catch (err) {
    return Promise.reject(err)
  }
}

export const Signout = async (cancelToken: CancelTokenSource | undefined | null = null) => {
  const endpoint = '/auth/signout'
  try {
    await axios.post<null, AxiosResponse<null>>(endpoint, null, {
      cancelToken: cancelToken?.token
    })
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}
