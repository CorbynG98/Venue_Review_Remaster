<template>
  <div class="signin">
    <v-card class="signInCard">
      <h1 style="margin-bottom: 2rem">Sign In</h1>
      <v-text-field
        label="Username or Email"
        :rules="usernameRules"
        hide-details="auto"
        style="margin-bottom: 1rem"
        v-model="credentials.username"
      ></v-text-field>
      <v-text-field
        label="Password"
        type="password"
        :rules="passwordRules"
        hide-details="auto"
        style="margin-bottom: 1rem"
        v-model="credentials.password"
      ></v-text-field>
      <div class="buttonContainer">
        <v-btn v-on:click="signin()" style="width: 5rem" v-bind:disabled="loginLoading">
          <span v-if="!loginLoading">Signin</span>
          <semipolar-spinner
            :animation-duration="2000"
            :size="20"
            :color="'#000000'"
            v-if="loginLoading"
          />
        </v-btn>
        <p style="margin-left: 1rem">
          Don't have an account?<a class="linkText" v-on:click="this.$router.push('Signup')"
            >Sign Up.</a
          >
        </p>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { SemipolarSpinner } from 'epic-spinners';
import notyf from '../components/NotyfComponent';
export default {
  components: { SemipolarSpinner },
  data: () => ({
    usernameRules: [
      (value) => !!value || 'Required.',
      (value) => (value && value.length >= 3) || 'Min 3 characters'
    ],
    passwordRules: [
      (value) => !!value || 'Required.',
      (value) => (value && value.length >= 8) || 'Min 8 characters'
    ],
    credentials: {
      username: '',
      password: ''
    },
    loginLoading: false
  }),
  mounted: function () {
    if (this.$store.state.isLoggedIn) {
      this.$router.push('Home')
    }
  },
  methods: {
    signin: async function() {
      let usernameValid = !!this.credentials.username || this.credentials.username.length >= 3
      let passwordValid = !!this.credentials.password || this.credentials.password.length >= 8
      if (!usernameValid || !passwordValid) {
        notyf.error('Invalid username or password');
        return;
      }
      this.loginLoading = true
      try {
        await this.$store.dispatch('signin', this.credentials)
        this.credentials.username = ''
        this.credentials.password = ''
        this.loginLoading = false
        this.$router.push('Home')
      } catch (err) {
        this.loginLoading = false
      }
    }
  },
}
</script>

<style>
.signin {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.signInCard {
  width: 30%;
  padding: 1rem;
}
.buttonContainer {
  display: flex;
  align-items: center;
}
.linkText {
  cursor: pointer;
  margin-left: 0.5rem;
}
</style>
