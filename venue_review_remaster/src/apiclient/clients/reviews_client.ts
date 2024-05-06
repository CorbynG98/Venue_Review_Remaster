import { ReviewAuthorResource } from '@/models/ReviewResource'
import { AxiosResponse, CancelTokenSource } from 'axios'
import { axiosNodeInstance as axios } from '../../interceptors/axiosInterceptor'

export const GetReviewsByVenue = async (
  venue_id: string,
  cancelToken: CancelTokenSource | undefined | null = null
): Promise<ReviewAuthorResource> => {
  const endpoint = `venues/${venue_id}/reviews`
  try {
    const response = await axios.get<ReviewAuthorResource, AxiosResponse<ReviewAuthorResource>>(
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

export const SubmitReview = async (
  venue_id: string,
  review_data: any,
  cancelToken: CancelTokenSource | undefined | null = null
): Promise<void> => {
  const endpoint = `venues/${venue_id}/reviews`
  try {
    await axios.post<ReviewAuthorResource, AxiosResponse<ReviewAuthorResource>>(
      endpoint,
      review_data,
      {
        cancelToken: cancelToken?.token
      }
    )
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}
