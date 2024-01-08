<script lang="ts">
export default {
  mounted: function () {
    this.$store.dispatch('initBaseData')
  },
  methods: {
    goToPage(page: string) {
      this.$router.push(page)
    }
  }
}
</script>

<template>
  <div>
    <v-card style="border-radius: 0px !important">
      <v-layout>
        <v-navigation-drawer expand-on-hover rail theme="dark">
          <div v-if="this.$store.state.isLoggedIn">
            <v-list>
              <v-list-item
                :prepend-avatar="
                  this.$store.state.profile_photo_filename ??
                  'https://storage.googleapis.com/venue-review-user-dp/default-profile.png'
                "
                :title="this.$store.state.fullName"
                :subtitle="this.$store.state.username"
              ></v-list-item>
            </v-list>

            <v-divider></v-divider>
          </div>

          <v-list density="compact" nav>
            <v-list-item
              v-if="!this.$store.state.isLoggedIn"
              prepend-icon="mdi-login"
              title="Login"
              value="login"
              v-on:click="goToPage('Signin')"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-view-dashboard"
              title="Venues"
              value="venues"
              v-on:click="goToPage('Venues')"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-account-box"
              title="Profile"
              value="profile"
              v-on:click="goToPage('Profile')"
            ></v-list-item>
          </v-list>

          <template v-slot:append>
            <v-list-item
              v-if="this.$store.state.isLoggedIn"
              prepend-icon="mdi-exit-to-app"
              title="Logout"
              value="logout"
              v-on:click="this.$store.dispatch('signout')"
            ></v-list-item>
          </template>
        </v-navigation-drawer>

        <v-main style="height: 100vh; background-color: var(--color-background)">
          <RouterView />
        </v-main>
      </v-layout>
    </v-card>
  </div>
</template>
