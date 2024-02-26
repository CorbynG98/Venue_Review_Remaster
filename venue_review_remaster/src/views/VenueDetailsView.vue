<template>
  <div class="venue_details_container">
    <semipolar-spinner
      v-if="venueLoading || categoriesLoading"
      :animation-duration="2000"
      :size="40"
      :color="'#ffffff'"
    />
    <div class="venue_details" v-else>
      <div style="width: 100%; margin-bottom: 0.3rem">
        <div class="title_line" style="margin-bottom: 0.3rem">
          <div style="display: flex; align-items: center; width: 60%">
            <div style="width: 100%">
              <h1 style="color: white; width: auto" v-if="!isEditing">
                {{ this.venue.venue_name }}
              </h1>
              <v-text-field
                v-else
                style="background-color: white; width: 100%"
                v-model="venue.venue_name"
                hide-details="auto"
                single-line
                density="compact"
              ></v-text-field>
            </div>
          </div>
          <a class="return_button" v-on:click="this.$router.push('/Venues')"
            >Return to venue list</a
          >
        </div>
        <div>
          <p
            v-if="
              venue.short_description != null && venue.short_description.length >= 5 && !isEditing
            "
            class="white-text"
            style="line-height: 2.5rem"
          >
            {{ this.venue.short_description }}
          </p>
          <v-text-field
            v-else-if="isEditing"
            class="editableProperty"
            v-model="venue.short_description"
            hide-details="auto"
            single-line
            density="compact"
          ></v-text-field>
        </div>
      </div>
      <v-carousel show-arrows="hover">
        <v-carousel-item
          v-if="venue.photos == null || venue.photos.length === 0"
          src="https://storage.googleapis.com/venue-review-venue-image/default.jpg"
          lazy-src="https://storage.googleapis.com/venue-review-venue-image/default.jpg"
          cover
        ></v-carousel-item>
        <v-carousel-item
          v-else
          v-for="image in venue.photos"
          v-bind:key="image.photo_filename"
          :src="image.photo_filename"
          lazy-src="https://storage.googleapis.com/venue-review-venue-image/default.jpg"
          cover
        ></v-carousel-item>
      </v-carousel>
      <div class="padder"></div>
      <div class="info_container">
        <div class="info_data">
          <div>
            <p class="white-text" style="line-height: 2.5rem">Category:&nbsp;&nbsp;</p>
            <p class="white-text" style="line-height: 2.5rem">Star Rating:&nbsp;&nbsp;</p>
            <p class="white-text" style="line-height: 2.5rem">Cost Rating:&nbsp;&nbsp;</p>
            <p v-if="isEditing" class="white-text" style="line-height: 2.5rem">
              Longitude:&nbsp;&nbsp;
            </p>
          </div>
          <div>
            <div>
              <p v-if="!this.isEditing" class="white-text" style="line-height: 2.5rem">
                {{ this.venue.category_name }}
              </p>
              <v-select
                v-else
                class="editableProperty"
                v-model="selectedCategory"
                :items="categories"
                item-title="category_name"
                item-value="category_id"
                hide-details
                single-line
                density="compact"
                :change="categoryUpdated()"
              ></v-select>
            </div>
            <div style="height: 2.5rem; display: flex; align-items: center">
              <star-rating
                :rating="formatRatingNumber(this.venue.avg_star_rating.toString())"
                :increment="0.1"
                :read-only="true"
                :show-rating="false"
                :star-size="25"
              ></star-rating>
            </div>
            <p class="white-text" style="line-height: 2.5rem">
              {{ getDollarSigns(this.venue.avg_cost_rating) }}
            </p>
            <div v-if="isEditing">
              <v-text-field
                class="editableProperty"
                v-model="venue.longitude"
                hide-details="auto"
                single-line
                density="compact"
              ></v-text-field>
            </div>
          </div>
        </div>
        <div class="info_data">
          <div>
            <p class="white-text" style="line-height: 2.5rem">Admin:&nbsp;&nbsp;</p>
            <p class="white-text" style="line-height: 2.5rem">Created:&nbsp;&nbsp;</p>
            <p class="white-text" style="line-height: 2.5rem">City:&nbsp;&nbsp;</p>
            <p v-if="isEditing" class="white-text" style="line-height: 2.5rem">
              Latitude:&nbsp;&nbsp;
            </p>
          </div>
          <div>
            <p class="white-text" style="line-height: 2.5rem">{{ this.venue.username }}</p>
            <p class="white-text" style="line-height: 2.5rem">
              {{ this.formatCreatedDate(this.venue.date_added) }}
            </p>
            <div>
              <p v-if="!this.isEditing" class="white-text" style="line-height: 2.5rem">
                {{ this.venue.city }}
              </p>
              <v-text-field
                v-else
                class="editableProperty"
                v-model="venue.city"
                hide-details="auto"
                single-line
                density="compact"
              ></v-text-field>
            </div>
            <div v-if="isEditing">
              <v-text-field
                class="editableProperty"
                v-model="venue.latitude"
                hide-details="auto"
                single-line
                density="compact"
              ></v-text-field>
            </div>
          </div>
        </div>
      </div>
      <div class="padder"></div>
      <hr style="width: 100%" />
      <div class="padder"></div>
      <div
        style="width: 100%"
        v-if="(venue.long_description != null && venue.long_description.length >= 5) || isEditing"
      >
        <div class="padder" v-if="!isEditing"></div>
        <div style="width: 100%">
          <p v-if="!this.isEditing" class="white-text">{{ this.venue.long_description }}</p>
          <v-textarea
            v-else
            style="background-color: white"
            v-model="venue.long_description"
            placeholder="Long Description"
            hide-details="auto"
            density="compact"
          ></v-textarea>
        </div>
        <div class="padder" v-if="!isEditing"></div>
        <div class="padder"></div>
        <hr style="width: 100%" />
        <div class="padder"></div>
      </div>
      <div class="info_container">
        <div class="info_data" style="width: 100%">
          <div>
            <p
              class="white-text"
              v-if="(venue.address != null && venue.address.length >= 5) || isEditing"
              style="line-height: 2.5rem"
            >
              Address:&nbsp;&nbsp;
            </p>
          </div>
          <div style="width: 100%">
            <div style="width: 100%">
              <p
                v-if="venue.address != null && venue.address.length >= 5 && !isEditing"
                class="white-text"
                style="line-height: 2.5rem"
              >
                {{ this.venue.address }}
              </p>
              <v-text-field
                v-else-if="isEditing"
                class="editableProperty"
                v-model="venue.address"
                hide-details="auto"
                single-line
                density="compact"
              ></v-text-field>
            </div>
          </div>
        </div>
      </div>
      <div class="padder"></div>
      <hr style="width: 100%" />
      <div class="padder"></div>
      <div v-if="this.isEditing" style="width: 100%">
        <div>
          <v-btn
            v-on:click="saveChanges()"
            style="background-color: #55cc69"
            v-bind:disabled="!this.isEditing"
          >
            <p v-if="!venueUpdating" style="font-weight: bold">Save</p>
            <semipolar-spinner v-else :animation-duration="2000" :size="20" :color="'#000000'" />
          </v-btn>
          <v-btn
            v-on:click="cancelEdits()"
            style="background-color: #f44336; margin-left: 1rem"
            v-bind:disabled="!this.isEditing"
          >
            <p style="font-weight: bold">Cancel</p>
          </v-btn>
        </div>
      </div>
      <div v-else style="width: 100%">
        <v-btn
          v-if="this.venue.username === this.$store.state.username"
          v-on:click="enterEditMode()"
          style="background-color: #55cc69"
          v-bind:disabled="this.isEditing"
        >
          <p style="font-weight: bold">Edit</p>
        </v-btn>
        <v-btn
          v-if="this.$store.state.isLoggedIn && this.venue.username !== this.$store.state.username"
          v-on:click="openReviewModal()"
          style="background-color: #2196f3"
          v-bind:disabled="this.isEditing"
        >
          <p style="font-weight: bold">Review</p>
        </v-btn>
      </div>
      <div class="review_container">
        <h1 class="white-text" style="padding-bottom: 1rem">Reviews</h1>
        <div
          class="review_details"
          v-for="review in reviews"
          v-bind:key="review.review_author.user_id"
        >
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: flex-start;
              padding-bottom: 0.5rem;
            "
          >
            <v-img
              height="50"
              max-width="50"
              style="border-radius: 50%; margin-right: 1rem"
              :src="
                review.review_author.profile_photo_filename ??
                'https://storage.googleapis.com/venue-review-user-dp/default-profile.png'
              "
            >
              <template v-slot:error>
                <v-img
                  height="50"
                  max-width="50"
                  style="border-radius: 50%"
                  src="https://storage.googleapis.com/venue-review-user-dp/default-profile.png"
                ></v-img>
              </template>
            </v-img>
            <p class="white-text" style="font-size: 1.5rem">{{ review.review_author.username }}</p>
          </div>
          <div>
            <div class="info_data">
              <p class="white-text">Star Rating:&nbsp;&nbsp;</p>
              <star-rating
                :rating="formatRatingNumber(review.star_rating.toString())"
                :increment="0.1"
                :read-only="true"
                :show-rating="false"
                :star-size="20"
              ></star-rating>
              <p class="white-text">&nbsp;&nbsp;|&nbsp;&nbsp;</p>
              <p class="white-text">Cost Rating:&nbsp;&nbsp;</p>
              <p class="white-text">{{ getDollarSigns(review.cost_rating.toString()) }}</p>
            </div>
          </div>
          <div>
            <p style="color: #aaaaaa">
              Reviewed on {{ this.formatCreatedDate(review.time_posted) }}
            </p>
          </div>
          <div>
            <p class="white-text">{{ review.review_body }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { SemipolarSpinner } from 'epic-spinners'
import { DateTime } from 'luxon'
import StarRating from 'vue-star-rating'
import { GetReviewsByVenue } from '../apiclient/clients/reviews_client'
import { GetCategories, GetVenueById, UpdateVenue } from '../apiclient/clients/venues_client'
import notyf from '../components/NotyfComponent'
import { CategoryeResource } from '../models/CategoryResource'
import { ReviewResource } from '../models/ReviewResource'
import { VenueDetailsResource } from '../models/VenueResource'
export default {
  components: { SemipolarSpinner, StarRating },
  data: () => ({
    venue: {} as VenueDetailsResource,
    venueCopy: '',
    selectedCategory: null,
    reviews: [] as ReviewResource[],
    categories: [] as CategoryeResource[],
    venueLoading: true,
    reviewsLoading: true,
    categoriesLoading: true,
    isEditing: false,
    venueUpdating: false
  }),
  mounted: function () {
    this.getVenues()
    this.getCategories()
    this.getReviews()
  },
  methods: {
    enterEditMode() {
      this.venueCopy = JSON.stringify(this.venue)
      this.selectedCategory = this.venue.category_id
      this.isEditing = true
    },
    cancelEdits() {
      this.venue = JSON.parse(this.venueCopy)
      this.venueCopy = ''
      this.isEditing = false
    },
    saveChanges() {
      if (this.venueUpdating) return
      this.venueUpdating = true
      UpdateVenue(this.$route.params.venue_id, this.venue)
        .then(() => {
          this.venueUpdating = false
          this.isEditing = false
          this.venueCopy = ''
          notyf.success('Changes saved!')
        })
        .catch((err) => {
          this.venueUpdating = false
          if (err == 'Network error') return // We handle this error type globally
          notyf.error(err)
        })
    },
    categoryUpdated() {
      if (this.selectedCategory) {
        const category = this.categories.find((cat) => cat.category_id === this.selectedCategory)
        this.venue.category_name = category.category_name
        this.venue.category_id = category.category_id
        this.venue.category_description = category.category_description
      }
    },
    openReviewModal() {
      console.log('Going to leave a review for this venue!')
    },
    formatRatingNumber(ratingRaw: string) {
      if (ratingRaw === null || ratingRaw === undefined) {
        return 2.5
      }
      return parseFloat(parseFloat(ratingRaw).toFixed(2))
    },
    formatCreatedDate(date: string) {
      return DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED)
    },
    getDollarSigns(costRating: string) {
      const numericCostRating = parseInt(costRating, 10)
      if (
        numericCostRating === null ||
        numericCostRating === undefined ||
        numericCostRating === 0
      ) {
        return 'Free'
      }
      return '$'.repeat(numericCostRating)
    },
    getVenues: async function () {
      this.venueLoading = true
      GetVenueById(this.$route.params.venue_id)
        .then((result) => {
          this.venue = result
          this.venueLoading = false
        })
        .catch((err) => {
          this.venueLoading = false
          if (err == 'Network error') return // We handle this error type globally
          notyf.error(err)
        })
    },
    getReviews: async function () {
      this.reviewsLoading = true
      GetReviewsByVenue(this.$route.params.venue_id)
        .then((result) => {
          this.reviews = result
          this.reviewsLoading = false
        })
        .catch((err) => {
          this.reviewsLoading = false
          if (err == 'Network error') return // We handle this error type globally
          notyf.error(err)
        })
    },
    getCategories: async function () {
      this.categoriesLoading = true
      GetCategories(this.queryParams)
        .then((result) => {
          this.categories = result
          this.categoriesLoading = false
        })
        .catch((err) => {
          this.categoriesLoading = false
          if (err == 'Network error') return // We handle this error type globally
          notyf.error(err)
        })
    }
  }
}
</script>

<style>
.venue_details_container {
  min-height: 100vh;
  padding: 1rem;
  display: flex;
  justify-content: center;
  overflow: auto;
}
.venue_details {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30%;
}
.title_line {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.white-text {
  color: #ffffff;
}
.info_container {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.info_data {
  display: flex;
}
.return_button {
  color: white;
  transition: 0.2s;
}
.return_button:hover {
  cursor: pointer;
  color: #aaaaaa;
}
.padder {
  height: 0.5rem;
}
.review_container {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
}
.review_details {
  padding-bottom: 2rem;
}
.editableProperty {
  background-color: white;
  color: black;
  padding: 0;
  margin: 0;
  min-height: 2.5rem;
}
</style>
