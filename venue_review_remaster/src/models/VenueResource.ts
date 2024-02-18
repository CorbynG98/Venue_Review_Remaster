export type VenueSummaryResource = {
  venue_id: string | null | undefined
  venue_name: string | null | undefined
  category_id: string | null | undefined
  city: string | null | undefined
  short_description: string | null | undefined
  latitude: number | null | undefined
  longitude: number | null | undefined
  avg_star_rating: number | null | undefined
  avg_cost_rating: number | null | undefined
  primary_photo: string | null | undefined
  distance: number | null | undefined
}

export type VenueDetailsResource = {
  venue_name: string | null | undefined
  admin_id: string | null | undefined
  username: string | null | undefined
  category_id: string | null | undefined
  category_name: string | null | undefined
  category_description: string | null | undefined
  city: string | null | undefined
  short_description: string | null | undefined
  long_description: string | null | undefined
  date_added: Date | null | undefined
  address: string | null | undefined
  latitude: number | null | undefined
  longitude: number | null | undefined
  avg_star_rating: number | null | undefined
  avg_cost_rating: number | null | undefined
  photos: VenuePhotoResource[] | null | undefined
}

export type VenuePhotoResource = {
  photo_filename: string | null | undefined
  photo_description: string | null | undefined
  is_primary: boolean | null | undefined
}
