import { ReviewAuthorResource } from '@/models/ReviewResource'
import { AxiosResponse, CancelTokenSource } from 'axios'
import { axiosNodeInstance as axios } from '../../interceptors/axiosInterceptor'

// export type VenueQueryParams = {
//   longitude: number
//   latitude: number
//   limit: number
//   page: number
//   category: string
//   admin: string
//   name: string
//   maxCostRating: 0 | 1 | 2 | 3 | 4 | 5
//   minStarRating: 0 | 1 | 2 | 3 | 4 | 5
//   sortBy: 'avg_star_rating' | 'avg_cost_rating' | 'distance'
//   isDesc: boolean
// }

// Leaving this here for now. Will probably implement paging for reviews soon, so will need some params for that.
// function convertParamsToStrings(params: Record<string, any>): Record<string, string> {
//   const stringParams: Record<string, string> = {}
//   Object.keys(params).forEach((key) => {
//     if (params[key] === null || params[key] === undefined) {
//       return
//     }
//     stringParams[key] = String(params[key])
//   })
//   return stringParams
// }

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
