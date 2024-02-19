export type ReviewResource = {
  review_body: string | null | undefined
  star_rating: string | null | undefined
  cost_rating: string | null | undefined
  time_posted: string | null | undefined
  review_author: ReviewAuthorResource | null | undefined
}

export type ReviewAuthorResource = {
  user_id: string | null | undefined
  username: string | null | undefined
  profile_photo_filename: string | null | undefined
}
