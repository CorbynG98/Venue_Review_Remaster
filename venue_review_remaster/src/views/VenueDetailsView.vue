<template>
  <div class="venue_details_container">
    <semipolar-spinner
      v-if="venueLoading"
      :animation-duration="2000"
      :size="40"
      :color="'#ffffff'"
    />
    <div class="venue_details" v-else>
      <div class="title_line">
        <h1 style="color: white">{{ this.venue.venue_name }}</h1>
        <a class="return_button" v-on:click="this.$router.push('/Venues')">Return to venue list</a>
      </div>
      <v-carousel show-arrows="hover">
        <v-carousel-item
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
            <p class="white-text">Category:&nbsp;&nbsp;</p>
            <p class="white-text">Star Rating:&nbsp;&nbsp;</p>
            <p class="white-text">Cost Rating:&nbsp;&nbsp;</p>
          </div>
          <div>
            <p class="white-text">{{ this.venue.category_name }}</p>
            <star-rating
              :rating="formatRatingNumber(this.venue.avg_star_rating.toString())"
              :increment="0.1"
              :read-only="true"
              :show-rating="false"
              :star-size="20"
            ></star-rating>
            <p class="white-text">{{ getDollarSigns(this.venue.avg_cost_rating) }}</p>
          </div>
        </div>
        <div class="info_data">
          <div>
            <p class="white-text">Admin:&nbsp;&nbsp;</p>
            <p class="white-text">Created:&nbsp;&nbsp;</p>
            <p class="white-text">City:&nbsp;&nbsp;</p>
          </div>
          <div>
            <p class="white-text">{{ this.venue.username }}</p>
            <p class="white-text">{{ this.formatCreatedDate(this.venue.date_added) }}</p>
            <p class="white-text">{{ this.venue.city }}</p>
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
import { GetVenueById } from '../apiclient/clients/venues_client'
import notyf from '../components/NotyfComponent'
import { VenueDetailsResource } from '../models/VenueResource'
export default {
  components: { SemipolarSpinner, StarRating },
  data: () => ({
    venue: {} as VenueDetailsResource,
    venueLoading: true
  }),
  mounted: function () {
    this.getVenues()
  },
  methods: {
    formatRatingNumber(ratingRaw: string) {
      if (ratingRaw === null || ratingRaw === undefined) {
        return 2.5
      }
      return parseFloat(parseFloat(ratingRaw).toFixed(2))
    },
    formatCreatedDate(date: string) {
      return DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED)
    },
    getDollarSigns(costRating: number) {
      if (costRating === null || costRating === undefined || costRating === 0) {
        return 'Free'
      }
      return '$'.repeat(costRating)
    },
    getVenues: async function () {
      this.venueLoading = true
      GetVenueById(this.$route.params.venue_id)
        .then((result) => {
          console.log('test', result)
          this.venue = result
          this.venueLoading = false
        })
        .catch((err) => {
          this.venuesLoading = false
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
</style>
