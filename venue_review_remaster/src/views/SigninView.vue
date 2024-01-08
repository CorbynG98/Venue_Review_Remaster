<template>
  <div class="signin">
    <v-card class="signInCard">
      <h1 style="margin-bottom: 2rem">Sign In</h1>
      <v-form ref="form" @submit.prevent>
        <v-text-field
          v-model="credentials.username"
          label="Username"
          :rules="usernameRules"
          required
        ></v-text-field>

        <v-text-field
          v-model="credentials.password"
          type="password"
          label="Password"
          :rules="passwordRules"
          required
          style="margin-bottom: 1rem"
        ></v-text-field>

        <div class="buttonContainer">
          <div style="width: 6rem">
            <v-btn
              v-on:click="signin()"
              type="submit"
              block
              style="background-color: #55cc69"
              v-bind:disabled="loginLoading"
            >
              <p v-if="!loginLoading" style="font-weight: bold">Signin</p>
              <semipolar-spinner
                :animation-duration="2000"
                :size="20"
                :color="'#000000'"
                v-if="loginLoading"
              />
            </v-btn>
          </div>
          <p style="margin-left: 1rem">
            Need an account?<a class="linkText" v-on:click="this.$router.push('Signup')"
              >Sign Up.</a
            >
          </p>
        </div>
      </v-form>
    </v-card>
  </div>
</template>

<script lang="ts">
import { SemipolarSpinner } from 'epic-spinners'
import notyf from '../components/NotyfComponent'
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
    signin: async function () {
      const { valid } = await this.$refs.form.validate()
      if (!valid) {
        notyf.error('Fix validation errors, and try again.')
        return
      }
      this.loginLoading = true
      try {
        await this.$store.dispatch('signin', this.credentials)
        this.$refs.form.reset()
        this.loginLoading = false
        this.$router.push('Home')
      } catch (err) {
        this.loginLoading = false
      }
    }
  }
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
  width: 40%;
  padding: 1rem;
}
.buttonContainer {
  display: flex;
  align-items: center;
}
.linkText {
  cursor: pointer;
  margin-left: 0.5rem;
  color: #55cc69;
}
</style>
