<template>
  <div class="signup">
    <v-card class="signUpCard mx-auto">
      <h1 style="margin-bottom: 2rem">Sign Up</h1>
      <v-form ref="form" @submit.prevent>
        <v-text-field
          v-model="userData.givenName"
          label="First name"
          :rules="nameRules"
          required
        ></v-text-field>

        <v-text-field
          v-model="userData.familyName"
          label="Last name"
          :rules="nameRules"
          required
        ></v-text-field>

        <v-text-field
          v-model="userData.username"
          label="Username"
          :rules="usernameRules"
          required
        ></v-text-field>

        <v-text-field
          v-model="userData.email"
          label="Email"
          :rules="emailRules"
          required
        ></v-text-field>

        <v-text-field
          v-model="userData.password"
          type="password"
          label="Password"
          :rules="passwordRules"
          required
        ></v-text-field>

        <v-text-field
          v-model="confirmPassword"
          type="password"
          label="Confirm Password"
          :rules="confirmPasswordRules()"
          style="margin-bottom: 1rem"
        ></v-text-field>

        <div class="buttonContainer">
          <div style="width: 6rem">
            <v-btn
              v-on:click="signup()"
              type="submit"
              block
              style="background-color: #55cc69"
              v-bind:disabled="signupLoading"
            >
              <p v-if="!signupLoading" style="font-weight: bold">Signup</p>
              <semipolar-spinner
                :animation-duration="2000"
                :size="20"
                :color="'#000000'"
                v-if="signupLoading"
              />
            </v-btn>
          </div>
          <p style="margin-left: 1rem">
            Already have an account?<a class="linkText" v-on:click="this.$router.push('/Signin')"
              >Sign In.</a
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
    emailRules: [
      (value) => !!value || 'Required.',
      (value) => /.+@.+\..+/.test(value) || 'Invalid email',
      (value) => (value && value.length >= 5) || 'Min 5 characters',
      (value) => (value && value.length <= 100) || 'Max 100 characters'
    ],
    nameRules: [
      (value) => !!value || 'Required.',
      (value) => (value && value.length <= 100) || 'Max 100 characters'
    ],
    passwordRules: [
      (value) => !!value || 'Required.',
      (value) => (value && value.length >= 8) || 'Min 8 characters'
    ],
    userData: {
      username: '',
      email: '',
      givenName: '',
      familyName: '',
      password: ''
    },
    confirmPassword: '',
    signupLoading: false
  }),
  mounted: function () {
    if (this.$store.state.isLoggedIn) {
      this.$router.push('/Home')
    }
  },
  computed: {
    passwordConfirmationRule() {
      return (value) => value === this.userData.password || 'Passwords must match'
    }
  },
  methods: {
    confirmPasswordRules() {
      return this.passwordRules.concat(this.passwordConfirmationRule)
    },
    signup: async function () {
      const { valid } = await this.$refs.form.validate()
      if (!valid) {
        notyf.error('Fix validation errors, and try again.')
        return
      }
      this.signupLoading = true
      try {
        await this.$store.dispatch('signup', this.userData)
        this.$refs.form.reset()
        this.signupLoading = false
        this.$router.push('/Home')
      } catch (err) {
        notyf.error(err.response.data.message)
        this.signupLoading = false
      }
    }
  }
}
</script>

<style>
.signup {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.signUpCard {
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
