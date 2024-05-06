<template>
  <div class="profile_details_container">
    <semipolar-spinner
      v-if="profileLoading"
      :animation-duration="2000"
      :size="40"
      :color="'#ffffff'"
    />
    <div class="profile_details" v-else>
      <div class="profile_pic_container">
        <v-img
          max-width="15rem"
          max-height="15rem"
          min-width="15rem"
          min-height="15rem"
          class="profile_image"
          :src="
            profile.profile_photo_filename ??
            'https://storage.googleapis.com/venue-review-user-dp/default-profile.png'
          "
        >
          <template v-slot:error>
            <v-img
              max-width="15rem"
              max-height="15rem"
              min-width="15rem"
              min-height="15rem"
              src="https://storage.googleapis.com/venue-review-user-dp/default-profile.png"
            ></v-img>
          </template>
          <v-btn
            class="edit-icon"
            style="width: 15rem; height: 15rem; border-radius: 0"
            @click="dialog = true"
          >
            <i class="material-icons" style="font-size: 8rem">edit</i>
          </v-btn>
        </v-img>
      </div>
      <div class="details_container">
        <div style="display: flex; justify-content: center; align-items: center">
          <div
            style="
              width: 12rem;
              display: flex;
              align-items: flex-start;
              flex-direction: column;
              padding-left: 1rem;
            "
          >
            <strong style="color: white; font-size: 1.3rem; line-height: 2.5rem">Username:</strong>
            <strong style="color: white; font-size: 1.3rem; line-height: 2.5rem">Email:</strong>
            <strong style="color: white; font-size: 1.3rem; line-height: 2.5rem"
              >First name:</strong
            >
            <strong style="color: white; font-size: 1.3rem; line-height: 2.5rem"
              >Family name:</strong
            >
          </div>
          <div style="width: 25rem; padding-left: 0.2rem">
            <div style="width: auto">
              <p v-if="!isEditing" style="color: white; font-size: 1.3rem; line-height: 2.5rem">
                {{ this.profile.username }}
              </p>
              <v-text-field
                v-else-if="isEditing"
                class="editableProperty"
                v-model="profile.username"
                hide-details="auto"
                single-line
                density="compact"
                style="width: 20rem"
              ></v-text-field>
            </div>
            <div style="width: auto">
              <p v-if="!isEditing" style="color: white; font-size: 1.3rem; line-height: 2.5rem">
                {{ this.profile.email }}
              </p>
              <v-text-field
                v-else-if="isEditing"
                class="editableProperty"
                v-model="profile.email"
                hide-details="auto"
                single-line
                density="compact"
                style="width: 20rem"
              ></v-text-field>
            </div>
            <div style="width: auto">
              <p v-if="!isEditing" style="color: white; font-size: 1.3rem; line-height: 2.5rem">
                {{ this.profile.given_name }}
              </p>
              <v-text-field
                v-else-if="isEditing"
                class="editableProperty"
                v-model="profile.given_name"
                hide-details="auto"
                single-line
                density="compact"
                style="width: 20rem"
              ></v-text-field>
            </div>
            <div style="width: auto">
              <p v-if="!isEditing" style="color: white; font-size: 1.3rem; line-height: 2.5rem">
                {{ this.profile.family_name }}
              </p>
              <v-text-field
                v-else-if="isEditing"
                class="editableProperty"
                v-model="profile.family_name"
                hide-details="auto"
                single-line
                density="compact"
                style="width: 20rem"
              ></v-text-field>
            </div>
          </div>
        </div>
        <div style="margin-top: 1rem; margin-left: 1rem">
          <v-btn
            v-on:click="this.isEditing = true"
            style="background-color: #2196f3; width: 5rem"
            v-if="!this.isEditing"
          >
            <p style="font-weight: bold">Edit</p>
          </v-btn>
          <v-btn v-on:click="updateProfile()" style="background-color: #55cc69; width: 5rem" v-else>
            <p v-if="!profileUpdating" style="font-weight: bold">Save</p>
            <semipolar-spinner :animation-duration="2000" :size="20" :color="'#000000'" v-else />
          </v-btn>
        </div>
      </div>
    </div>
    <div style="display: flex; align-items: center; justify-content: center; padding-top: 2rem">
      <p style="color: white">
        Will eventually get a session table here, showing all the sessions for a user.
      </p>
    </div>
  </div>
  <v-dialog v-model="dialog" width="auto">
    <v-card min-width="40rem">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-h5 text-medium-emphasis ps-2">Upload profile photo</div>

        <v-btn icon="mdi-close" variant="text" @click="dialog = false"></v-btn>
      </v-card-title>
      <v-divider class="mb-4"></v-divider>
      <v-card-text style="display: flex; flex-direction: column; align-items: center">
        <div>
          <v-img
            max-width="20rem"
            max-height="20rem"
            min-width="20rem"
            min-height="20rem"
            :src="
              imagePreview ??
              'https://storage.googleapis.com/venue-review-user-dp/default-profile.png'
            "
          >
            <template v-slot:error>
              <v-img
                max-width="20rem"
                max-height="20rem"
                min-width="20rem"
                min-height="20rem"
                src="https://storage.googleapis.com/venue-review-user-dp/default-profile.png"
              ></v-img>
            </template>
          </v-img>
        </div>
        <v-file-input
          :rules="rules"
          clearable
          v-model="newPhoto"
          accept="image/png, image/jpeg, image/bmp"
          label="Avatar"
          placeholder="Pick an avatar"
          prepend-icon="mdi-camera"
          style="width: 100%; margin-top: 1rem"
          @change="updateImagePreview"
          @click:clear="clearPreviewImage"
        ></v-file-input>
      </v-card-text>
      <v-divider class="mb-4"></v-divider>
      <template v-slot:actions>
        <div style="width: 100%; display: flex; justify-content: space-between">
          <div>
            <v-btn @click="dialog = false" style="background-color: #2196f3">
              <p style="font-weight: bold">Cancel</p>
            </v-btn>
            <v-btn
              @click="uploadProfilePhoto()"
              style="background-color: #55cc69"
              :disabled="this.newPhoto == null"
            >
              <p style="font-weight: bold">Upload</p>
            </v-btn>
          </div>
          <div>
            <v-btn
              @click="deleteConfirmDialog = true"
              :disabled="this.profile.profile_photo_filename == null"
              style="background-color: #f44336"
            >
              <p style="font-weight: bold">Remove</p>
            </v-btn>
          </div>
        </div>
      </template>
    </v-card>
  </v-dialog>
  <v-dialog v-model="deleteConfirmDialog" max-width="400" persistent>
    <v-card
      prepend-icon="mdi-trash-can"
      text="This will remove your profile photo. This action cannot be undone, but a new image can be uploaded."
      title="Delete your profile picture?"
    >
      <template v-slot:actions>
        <v-spacer></v-spacer>

        <v-btn @click="deleteConfirmDialog = false"> Cancel </v-btn>

        <v-btn @click="removeProfilePhoto()"> Delete </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { SemipolarSpinner } from 'epic-spinners'
import { toRaw } from 'vue'
import {
  GetMyUserProfile,
  RemoveProfilePhoto,
  UpdateProfilePhoto,
  UpdateUserProfile
} from '../apiclient/apiclient'
import notyf from '../components/NotyfComponent'
import { UserBasicResource } from '../models/UserBasicResource'
export default {
  components: { SemipolarSpinner },
  data: () => ({
    profile: {} as UserBasicResource,
    profileLoading: true,
    profilePhotoUploading: false,
    profileUpdating: false,
    dialog: false,
    deleteConfirmDialog: false,
    newPhoto: null,
    imagePreview: null,
    rules: [
      (value: string | any[]) => {
        return (
          !value ||
          !value.length ||
          value[0].size < 2000000 ||
          'Avatar size should be less than 2 MB!'
        )
      }
    ],
    isEditing: false
  }),
  mounted: function () {
    if (!this.$store.state.isLoggedIn) {
      this.$router.push('/Home')
    } else {
      this.getProfileData()
    }
  },
  methods: {
    getProfileData: async function () {
      this.venueLoading = true
      GetMyUserProfile(this.$route.params.venue_id)
        .then((result) => {
          this.profile = result
          this.profileLoading = false
        })
        .catch((err) => {
          this.profileLoading = false
          if (err == 'Network error') return // We handle this error type globally
          notyf.error(err)
        })
    },
    uploadProfilePhoto: function () {
      if (this.profilePhotoUploading || this.newPhoto == null) return
      const previousImage = this.profile.profile_photo_filename
      this.profilePhotoUploading = true
      this.profile.profile_photo_filename = this.imagePreview
      this.dialog = false
      UpdateProfilePhoto(toRaw(this.newPhoto)[0])
        .then(() => {
          this.dialog = false
        })
        .catch((err) => {
          notyf.error(err.response.data.message)
          this.profile.profile_photo_filename = previousImage
          this.dialog = true
        })
        .finally(() => (this.profilePhotoUploading = false))
    },
    removeProfilePhoto: function () {
      if (this.profile.profile_photo_filename == null) return
      this.deleteConfirmDialog = false
      this.dialog = false
      const photoUrl = this.profile.profile_photo_filename
      this.profile.profile_photo_filename = null
      RemoveProfilePhoto().catch(() => {
        notyf.error('Failed to remove profile photo')
        this.profile.profile_photo_filename = photoUrl
      })
    },
    clearPreviewImage() {
      this.imagePreview = null
      this.newPhoto = null
    },
    updateImagePreview() {
      if (this.newPhoto) {
        this.imagePreview = URL.createObjectURL(this.newPhoto[0])
      } else {
        this.imagePreview = null
      }
    },
    updateProfile() {
      this.profileUpdating = true
      UpdateUserProfile(this.profile)
        .then(() => {
          this.isEditing = false
          notyf.success('Profile updated successfully!')
        })
        .catch((err) => {
          notyf.error(err.response.data.message)
        })
        .finally(() => (this.profileUpdating = false))
    }
  }
}
</script>

<style>
.profile_details_container {
  min-height: 100vh;
  padding: 1rem;
  padding-top: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: auto;
}
.profile_details {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 60%;
}
.editableProperty {
  background-color: white;
  color: black;
  padding: 0;
  margin: 0;
  min-height: 2.5rem;
}
.details_container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}
.profile_image {
  position: relative;
}
.edit-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}
.profile_image:hover .edit-icon {
  opacity: 0.6;
}
.profile_image:hover {
  cursor: pointer;
}
</style>
