<template>
  <div>
    <div
      style="padding-left: 0.5rem; padding-right: 0.5rem; padding-top: 1rem; padding-bottom: 0.5rem"
    >
      <v-row>
        <v-col cols="4">
          <div>
            <p style="color: white">Name Search</p>
          </div>
          <div style="display: flex; height: 2.5rem">
            <input type="text" v-model="queryParams.name" class="nameInput" />
            <v-btn
              v-on:click="resetNameSearch()"
              :disabled="queryParams.name == null || queryParams.name.length == 0"
              class="nameClearBtn"
            >
              Clear
            </v-btn>
          </div>
        </v-col>
        <v-col cols="4">
          <div>
            <p style="color: white">Category</p>
          </div>
          <div style="display: flex; height: 2.5rem" class="custom-select-wrapper">
            <select v-model="queryParams.category" class="custom-select">
              <option value="" selected>Select a category</option>
              <option
                v-for="category in categories"
                :key="category.category_id"
                :value="category.category_id"
              >
                {{ category.category_name }}
              </option>
            </select>
          </div>
        </v-col>
        <v-col cols="4">
          <div>
            <p style="color: white">Sorting</p>
          </div>
          <div style="display: flex; height: 2.5rem" class="custom-select-wrapper">
            <select v-model="selectedSortBy" class="custom-select">
              <option value="avg_star_rating-desc">Star Rating ↓</option>
              <option value="avg_star_rating-asc">Star Rating ↑</option>
              <option value="avg_cost_rating-desc">Cost Rating ↓</option>
              <option value="avg_cost_rating-asc">Cost Rating ↑</option>
              <option value="distance-desc">Distance ↓</option>
              <option value="distance-asc">Distance ↑</option>
            </select>
          </div>
        </v-col>
      </v-row>
    </div>
    <v-data-table-virtual
      :headers="headers"
      :items="venues"
      item-value="name"
      theme="dark"
      :loading="venuesLoading || categoriesLoading"
    >
      <template v-slot:[`item.primary_photo`]="{ item }">
        <td>
          <v-img
            :src="imageSrc(item.primary_photo)"
            :alt="item.venue_name"
            fluid
            style="max-width: 200px; max-height: 200px; min-width: 200px; min-height: 150px"
          />
        </td>
      </template>
      <template v-slot:[`item.avg_star_rating`]="{ item }">
        <td>
          <star-rating
            :rating="formatRatingNumber(item.avg_star_rating.toString())"
            :increment="0.1"
            :read-only="true"
            :show-rating="false"
            :star-size="20"
          ></star-rating>
        </td>
      </template>
      <template v-slot:[`item.category_id`]="{ item }">
        <td>
          {{ getCategoryName(item.category_id) }}
        </td>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <td>
          <p>Some random actions for {{ item.venue_id }}</p>
        </td>
      </template>
    </v-data-table-virtual>
    <CustomPaginationComponent
      :page="queryParams.page"
      :page-size="queryParams.limit"
      :item-count="venues.length"
      @update-page="updatePageData"
      @update-pageSize="updatePageSizeData"
    />
  </div>
</template>

<script lang="ts">
import { SemipolarSpinner } from 'epic-spinners'
import { debounce } from 'lodash'
import StarRating from 'vue-star-rating'
import { GetCategories, GetVenues, VenueQueryParams } from '../apiclient/clients/venues_client'
import notyf from '../components/NotyfComponent'
import CustomPaginationComponent from '../components/PaginationComponent.vue'
import { CategoryeResource } from '../models/CategoryResource'
import { VenueSummaryResource } from '../models/VenueResource'
export default {
  components: { SemipolarSpinner, StarRating, CustomPaginationComponent },
  data: () => ({
    headers: [
      { title: 'Image', align: 'start', key: 'primary_photo', sortable: false },
      { title: 'Name', align: 'start', key: 'venue_name', sortable: false },
      { title: 'Category', align: 'start', key: 'category_id', sortable: false },
      { title: 'City', align: 'start', key: 'city', sortable: false },
      { title: 'Description', align: 'start', key: 'short_description', sortable: false },
      { title: 'Star Rating', align: 'start', key: 'avg_star_rating', sortable: false },
      {
        title: 'Cost Rating',
        align: 'start',
        key: 'avg_cost_rating',
        sortable: false,
        value: (item) => {
          if (
            item.avg_cost_rating === null ||
            item.avg_cost_rating === undefined ||
            parseInt(item.avg_cost_rating) === 0
          ) {
            return 'Free'
          }
          return '$'.repeat(parseInt(item.avg_cost_rating))
        }
      },
      { title: 'Actions', align: 'start', key: 'actions', sortable: false }
    ],
    venues: [] as VenueSummaryResource[],
    categories: [] as CategoryeResource[],
    queryParams: {
      longitude: 0,
      latitude: 0,
      limit: 10,
      page: 1,
      category: null,
      admin: null,
      name: null,
      maxCostRating: 5,
      minStarRating: 0,
      sortBy: 'avg_star_rating',
      isDesc: true
    } as VenueQueryParams,
    venuesLoading: true,
    categoriesLoading: true,
    selectedSortBy: 'avg_star_rating-desc',
    isDistanceSort: false
  }),
  mounted: function () {
    this.getVenues()
    this.getCategories()
  },
  watch: {
    queryParams: {
      handler: debounce(function () {
        this.getVenues()
      }, 150),
      deep: true
    },
    selectedSortBy: {
      handler: debounce(function () {
        let sortBySplit = this.selectedSortBy.split('-')
        this.isDistanceSort = sortBySplit[0] === 'distance'
        this.queryParams.sortBy = sortBySplit[0]
        this.queryParams.isDesc = sortBySplit[1] === 'desc'
      }, 150)
    }
  },
  methods: {
    customLabel(option) {
      return `${option.library} - ${option.language}`
    },
    imageSrc(primaryPhoto: string) {
      // Check if the primary image exists and is valid
      if (primaryPhoto && this.isValidUrl(primaryPhoto)) {
        return primaryPhoto
      } else {
        // Return the fallback image if the primary image is not valid
        return 'https://storage.googleapis.com/venue-review-venue-image/default.jpg'
      }
    },
    resetNameSearch() {
      console.log('resetNameSearch')
      this.queryParams.name = null
    },
    isValidUrl(url) {
      return url !== null && url !== undefined && url.includes('https://storage.googleapis.com')
    },
    formatRatingNumber(ratingRaw: string) {
      if (ratingRaw === null || ratingRaw === undefined) {
        return 2.5
      }
      return parseFloat(parseFloat(ratingRaw).toFixed(2))
    },
    getDollarSigns(costRating: string) {
      if (costRating === null || costRating === undefined || parseInt(costRating) === 0) {
        return '$$'
      }
      return '$'.repeat(parseInt(costRating))
    },
    getCategoryName(categoryId: number) {
      if (categoryId === null || categoryId === undefined) {
        return 'Unknown'
      }
      const category = this.categories.find((category) => category.category_id === categoryId)
      if (category === null || category === undefined) {
        return 'Unknown'
      }
      return category.category_name
    },
    updatePageData(page: string) {
      this.queryParams.page = parseInt(page)
    },
    updatePageSizeData(pageSize: string) {
      this.queryParams = {
        ...this.queryParams,
        limit: parseInt(pageSize),
        page: 1
      }
    },
    getCategories: async function () {
      this.categoriesLoading = true
      GetCategories(this.queryParams)
        .then((result) => {
          this.categories = result
          this.categoriesLoading = false
        })
        .catch((err) => {
          notyf.error(err)
          this.categoriesLoading = false
        })
    },
    getVenues: async function () {
      this.venuesLoading = true
      GetVenues(this.queryParams)
        .then((result) => {
          this.venues = result
          // If we are doing distance sort, append the distance header to the headers array. Otherwise remove it
          if (this.isDistanceSort) {
            // Make sure there isn't a distance header already
            if (this.headers[this.headers.length - 2].key === 'distance') {
              this.venuesLoading = false
              return
            }
            // Splice the distance header in at the second last position
            this.headers.splice(this.headers.length - 1, 0, {
              title: 'Distance',
              align: 'start',
              key: 'distance',
              sortable: false,
              value: (item) => {
                if (item.distance === null || item.distance === undefined) {
                  return 'Unknown'
                }
                if (item <= 1) return (item.distance * 1000).toFixed(0) + 'm'
                return item.distance.toFixed(2) + 'km'
              }
            })
          } else {
            // Double check the distance header is there first
            if (this.headers[this.headers.length - 2].key === 'distance')
              this.headers.splice(this.headers.length - 2, 1)
          }
          this.venuesLoading = false
        })
        .catch((err) => {
          notyf.error(err)
          this.venuesLoading = false
        })
    }
  }
}
</script>

<style scoped>
.venues {
  min-height: 100vh;
  padding: 1rem;
}
.custom-text-field .v-input__control {
  background-color: white !important;
  width: 100% !important;
  height: 48px !important; /* adjust as needed */
  border: none !important;
}
.nameInput {
  background-color: white;
  flex-grow: 1;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.nameClearBtn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  height: 2.5rem !important;
}
.custom-select-wrapper {
  position: relative;
}

.custom-select {
  appearance: none; /* Remove default styling */
  flex-grow: 1;
  background-color: white;
  border: 1px solid #ced4da; /* Add custom border */
  padding: 0.5rem 1.5rem 0.5rem 0.75rem; /* Add some padding */
  border-radius: 0.25rem; /* Optional: round the corners */
  position: relative;
  -webkit-appearance: none; /* For Safari */
  padding-left: 1rem;
  padding-right: 1rem;
}
.custom-select-wrapper::after {
  content: '▼'; /* Add arrow icon */
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; /* Prevent the arrow from being clickable */
  color: #343a40; /* Arrow color */
}
</style>
