import { CategoryeResource } from '@/models/CategoryResource'
import { VenueDetailsResource, VenueSummaryResource } from '@/models/VenueResource'
import { AxiosResponse, CancelTokenSource } from 'axios'
import { axiosNodeInstance as axios } from '../../interceptors/axiosInterceptor'

export type VenueQueryParams = {
  longitude: number
  latitude: number
  limit: number
  page: number
  category: string
  admin: string
  name: string
  maxCostRating: 0 | 1 | 2 | 3 | 4 | 5
  minStarRating: 0 | 1 | 2 | 3 | 4 | 5
  sortBy: 'avg_star_rating' | 'avg_cost_rating' | 'distance'
  isDesc: boolean
}

type QueryParamValue = string | number | boolean | null

function convertParamsToStrings(params: Record<string, QueryParamValue>): Record<string, string> {
  const stringParams: Record<string, string> = {}
  Object.keys(params).forEach((key) => {
    if (params[key] === null || params[key] === undefined) {
      return
    }
    stringParams[key] = String(params[key])
  })
  return stringParams
}

export const GetCategories = async (
  cancelToken: CancelTokenSource | undefined | null = null
): Promise<CategoryeResource[]> => {
  const endpoint = `categories`
  try {
    const response = await axios.get<CategoryeResource[], AxiosResponse<CategoryeResource[]>>(
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

export const GetVenues = async (
  data: VenueQueryParams,
  cancelToken: CancelTokenSource | undefined | null = null
): Promise<VenueSummaryResource[]> => {
  const strifiedParams = convertParamsToStrings(data)
  const queryParams = new URLSearchParams(strifiedParams).toString()
  const endpoint = `venues?${queryParams}`
  try {
    const response = await axios.get<VenueSummaryResource[], AxiosResponse<VenueSummaryResource[]>>(
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

export const GetVenueById = async (
  venue_id: string,
  cancelToken: CancelTokenSource | undefined | null = null
): Promise<VenueDetailsResource> => {
  const endpoint = `venues/${venue_id}`
  try {
    const response = await axios.get<VenueDetailsResource, AxiosResponse<VenueDetailsResource>>(
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

export const UpdateVenue = async (
  venue_id: string,
  venue_data: VenueDetailsResource,
  cancelToken: CancelTokenSource | undefined | null = null
): Promise<void> => {
  const endpoint = `venues/${venue_id}`
  try {
    await axios.patch<void, AxiosResponse<void>>(endpoint, venue_data, {
      cancelToken: cancelToken?.token
    })
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}
