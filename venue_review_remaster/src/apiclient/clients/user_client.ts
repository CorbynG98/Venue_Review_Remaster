import { UserBasicResource } from '@/models/UserBasicResource'
import { AxiosResponse, CancelTokenSource } from 'axios'
import { axiosNodeInstance as axios } from '../../interceptors/axiosInterceptor'

export const GetMyUserProfile = async (
  cancelToken: CancelTokenSource | undefined | null = null
): Promise<UserBasicResource> => {
  const endpoint = '/users'
  try {
    const response = await axios.get<UserBasicResource, AxiosResponse<UserBasicResource>>(
      endpoint,
      {
        cancelToken: cancelToken?.token
      }
    )
    return Promise.resolve(response.data)
  } catch (err) {
    return Promise.reject(err)
  }
}

export const RemoveProfilePhoto = async (
  cancelToken: CancelTokenSource | undefined | null = null
): Promise<void> => {
  const endpoint = '/users/photo'
  try {
    await axios.delete<null, AxiosResponse<null>>(endpoint, {
      cancelToken: cancelToken?.token
    })
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}

export const UpdateProfilePhoto = async (
  photo: Blob,
  cancelToken: CancelTokenSource | undefined | null = null
): Promise<void> => {
  const endpoint = '/users/photo'
  const data = new FormData()
  data.append('photo', photo)
  try {
    await axios.put<void, AxiosResponse<void>>(endpoint, data, {
      cancelToken: cancelToken?.token
    })
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}

export const UpdateUserProfile = async (
  data: UserBasicResource,
  cancelToken: CancelTokenSource | undefined | null = null
): Promise<void> => {
  const endpoint = '/users'
  try {
    await axios.patch<UserBasicResource, AxiosResponse<UserBasicResource>>(endpoint, data, {
      cancelToken: cancelToken?.token
    })
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}
